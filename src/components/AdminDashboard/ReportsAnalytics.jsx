import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import jsPDF from 'jspdf';

function getDateRangeText(selectedPeriod) {
  const endDate = new Date();
  let startDate;
  switch (selectedPeriod) {
    case 'last7':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      break;
    case 'last30':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 29);
      break;
    case 'last90':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 89);
      break;
    case 'lastYear':
      startDate = new Date(endDate);
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 29);
  }
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

const ReportsAnalytics = () => {
  const { rewards } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('last30');
  const [loading, setLoading] = useState(false);

  // Metrics
  const [totalVisits, setTotalVisits] = useState(0);
  const [pointsIssued, setPointsIssued] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [returningCustomers, setReturningCustomers] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [mostPopularReward, setMostPopularReward] = useState('None');
  const [topRewards, setTopRewards] = useState([]);
  const [visitsData, setVisitsData] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [segmentation, setSegmentation] = useState({ active: 60, new: 25, atRisk: 15 }); // Placeholder

  // Modal for scheduling
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Ref for PDF export
  const reportRef = useRef();

  function getRange(selectedPeriod) {
    const endDate = new Date();
    let startDate;
    switch (selectedPeriod) {
      case 'last7':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        break;
      case 'last30':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 29);
        break;
      case 'last90':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 89);
        break;
      case 'lastYear':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 29);
    }
    return { startDate, endDate };
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { startDate, endDate } = getRange(selectedPeriod);
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // 1. Total Visits & Daily Visits
      const { data: checkins } = await supabase
        .from('checkins')
        .select('customer_id, created_at')
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      setTotalVisits(checkins?.length || 0);

      // Daily visits data for chart
      const visitsMap = {};
      checkins?.forEach(c => {
        const date = c.created_at.split('T')[0];
        visitsMap[date] = (visitsMap[date] || 0) + 1;
      });
      const visitsChart = [];
      const tempDate = new Date(startDate);
      while (tempDate <= endDate) {
        const key = tempDate.toISOString().split('T')[0];
        visitsChart.push({ date: key, count: visitsMap[key] || 0 });
        tempDate.setDate(tempDate.getDate() + 1);
      }
      setVisitsData(visitsChart);

      // 2. Points Issued (sum of all customers' lifetimePoints)
      const { data: customers } = await supabase
        .from('customers')
        .select('id, created_at, lifetimePoints');
      setPointsIssued(customers?.reduce((sum, c) => sum + (c.lifetimePoints || 0), 0) || 0);

      // 3. New Customers in range
      const newCustomersCount = customers?.filter(c => {
        const created = new Date(c.created_at);
        return created >= startDate && created <= endDate;
      }).length || 0;
      setNewCustomers(newCustomersCount);

      // 4. Returning Customers: any customer with 2+ check-ins in the period
      const returningMap = {};
      checkins?.forEach(c => {
        returningMap[c.customer_id] = (returningMap[c.customer_id] || 0) + 1;
      });
      setReturningCustomers(Object.values(returningMap).filter(c => c >= 2).length);

      // 5. Reward Redemptions
      const { data: redemptions } = await supabase
        .from('redemptions')
        .select('rewardId')
        .gte('redeemedAt', startISO)
        .lte('redeemedAt', endISO);

      setTotalRedemptions(redemptions?.length || 0);

      // Most popular reward
      let mostPopular = 'None';
      if (redemptions && redemptions.length > 0) {
        const rewardCounts = {};
        redemptions.forEach(r => {
          rewardCounts[r.rewardId] = (rewardCounts[r.rewardId] || 0) + 1;
        });
        const sorted = Object.entries(rewardCounts).sort((a, b) => b[1] - a[1]);
        const topRewardId = sorted[0][0];
        const match = rewards?.find(r => r.id === topRewardId);
        mostPopular = match?.name || 'Unknown';
      }
      setMostPopularReward(mostPopular);

      // Top Rewards block (by currentRedemptions)
      const sortedRewards = [...(rewards || [])]
        .sort((a, b) => (b.currentRedemptions || 0) - (a.currentRedemptions || 0))
        .slice(0, 3);
      setTopRewards(sortedRewards);

      // 6. Daily Points Issued (static/fake data for now)
      const pointsChart = visitsChart.map((d, i) => ({
        date: d.date,
        count: Math.floor(100 + 50 * Math.sin(i / 3) + Math.random() * 30)
      }));
      setPointsData(pointsChart);

      // 7. Customer Segmentation (placeholder)
      setSegmentation({ active: 60, new: 25, atRisk: 15 });

      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, [selectedPeriod, rewards]);

  // Chart summary helpers
  function getSummary(data) {
    if (!data.length) return { total: 0, avg: 0, max: 0 };
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const avg = Math.round(total / data.length);
    const max = Math.max(...data.map(d => d.count));
    return { total, avg, max };
  }
  const visitsSummary = getSummary(visitsData);
  const pointsSummary = getSummary(pointsData);

  // --- Export Handlers ---

  // 1. Download CSV
  function handleDownloadCSV() {
    // Prepare CSV rows
    const rows = [
      ['Metric', 'Value'],
      ['Total Visits', totalVisits],
      ['Points Issued', pointsIssued],
      ['New Customers', newCustomers],
      ['Returning Customers', returningCustomers],
      ['Total Redemptions', totalRedemptions],
      ['Most Popular Reward', mostPopularReward]
    ];
    rows.push([]);
    rows.push(['Date', 'Visits', 'Points Issued']);
    visitsData.forEach((v, i) => {
      rows.push([v.date, v.count, pointsData[i] ? pointsData[i].count : '']);
    });

    // Convert to CSV string
    const csvContent = rows.map(r => r.map(String).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // 2. Export PDF
  function handleExportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reports & Analytics', 10, 15);
    doc.setFontSize(10);
    doc.text(`Date Range: ${getDateRangeText(selectedPeriod)}`, 10, 22);

    let y = 32;
    doc.text('Summary:', 10, y);
    y += 6;
    doc.text(`Total Visits: ${totalVisits}`, 10, y);
    y += 6;
    doc.text(`Points Issued: ${pointsIssued}`, 10, y);
    y += 6;
    doc.text(`New Customers: ${newCustomers}`, 10, y);
    y += 6;
    doc.text(`Returning Customers: ${returningCustomers}`, 10, y);
    y += 6;
    doc.text(`Total Redemptions: ${totalRedemptions}`, 10, y);
    y += 6;
    doc.text(`Most Popular Reward: ${mostPopularReward}`, 10, y);

    y += 10;
    doc.text('Daily Customer Visits:', 10, y);
    y += 6;
    visitsData.forEach((v) => {
      doc.text(`${v.date}: ${v.count}`, 10, y);
      y += 5;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save('report.pdf');
  }

  // 3. Schedule Reports (modal)
  function handleScheduleReports() {
    setShowScheduleModal(true);
  }

  function closeModal() {
    setShowScheduleModal(false);
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header and Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <div className="mt-2 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="lastYear">Last 12 months</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-500 mb-2">
          Date Range: {getDateRangeText(selectedPeriod)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Total Visits"
          value={loading ? '...' : totalVisits}
          sub1={`Avg ${visitsSummary.avg} per day`}
          sub2={`Peak: ${visitsSummary.max}`}
        />
        <SummaryCard
          label="Points Issued"
          value={loading ? '...' : pointsIssued}
          sub1={`Avg ${pointsSummary.avg} per day`}
          sub2={`Peak: ${pointsSummary.max}`}
        />
        <SummaryCard
          label="Customer Growth"
          value={loading ? '...' : `+${newCustomers}`}
          sub1="New customers this period"
          sub2={`${returningCustomers} returning`}
        />
        <SummaryCard
          label="Reward Redemptions"
          value={loading ? '...' : totalRedemptions}
          sub1={`Most popular: ${mostPopularReward}`}
          sub2=""
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Customer Visits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Daily Customer Visits</h2>
          <BarChart data={visitsData} color="blue" />
        </div>
        {/* Daily Points Issued */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Daily Points Issued</h2>
          <BarChart data={pointsData} color="green" />
        </div>
      </div>

      {/* Customer Segmentation & Top Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Segmentation Pie (placeholder) */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Customer Segmentation</h2>
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="w-40 h-40 rounded-full border-8 border-gray-200 relative">
                {/* Pie chart placeholder */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div
                    className="absolute bg-blue-500 h-full"
                    style={{ width: `${segmentation.active}%`, left: 0 }}
                  ></div>
                  <div
                    className="absolute bg-green-500 h-full"
                    style={{ width: `${segmentation.new}%`, left: `${segmentation.active}%` }}
                  ></div>
                  <div
                    className="absolute bg-yellow-500 h-full"
                    style={{
                      width: `${segmentation.atRisk}%`,
                      left: `${segmentation.active + segmentation.new}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between w-full mt-6">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">Active ({segmentation.active}%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">New ({segmentation.new}%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">At Risk ({segmentation.atRisk}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Top Rewards */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Top Rewards</h2>
            <div className="space-y-4">
              {topRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{reward.name}</div>
                    <div className="text-xs text-gray-500">
                      {reward.currentRedemptions || 0} redemptions
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${
                          totalRedemptions
                            ? ((reward.currentRedemptions || 0) / totalRedemptions) * 100
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export/Download Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="flex items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
            onClick={handleDownloadCSV}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download CSV</span>
          </button>
          <button
            className="flex items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
            onClick={handleExportPDF}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Export PDF</span>
          </button>
          <button
            className="flex items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
            onClick={handleScheduleReports}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Schedule Reports</span>
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Schedule Reports</h3>
            <p className="mb-4">This feature will allow you to schedule report emails. (Coming soon!)</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Card
function SummaryCard({ label, value, sub1, sub2 }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      {sub1 && <div className="mt-2 text-xs text-gray-500">{sub1}</div>}
      {sub2 && <div className="mt-1 text-xs text-gray-500">{sub2}</div>}
    </div>
  );
}

// Bar Chart (simple CSS)
function BarChart({ data, color }) {
  if (!data.length) return <div className="text-gray-400 text-center mt-8">No data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="h-64 flex items-end gap-1">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className={`w-full bg-${color}-500 rounded-t`}
            style={{
              height: `${(item.count / max) * 100}%`,
              minHeight: 2
            }}
          ></div>
          <div className="text-[10px] mt-1">{item.date.split('-').slice(1).join('/')}</div>
        </div>
      ))}
    </div>
  );
}

export default ReportsAnalytics;