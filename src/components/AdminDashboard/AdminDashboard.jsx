import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const AdminDashboard = () => {
  const { business, customers, rewards } = useAppContext();
  const [stats, setStats] = useState({
    activeCustomers: 0,
    totalPoints: 0,
    avgPointsPerCustomer: 0,
    newCustomers7d: 0,
    retention: 0
  });

  // Rewards Redeemed filter and count
  const [rewardsFilter, setRewardsFilter] = useState('all');
  const [rewardsRedeemed, setRewardsRedeemed] = useState(0);

  const dataReady = customers.length > 0 && rewards && rewards.length > 0;

  useEffect(() => {
    if (dataReady) {
      const totalCustomers = customers.length;
      const totalPoints = customers.reduce((sum, c) => sum + c.availablePoints, 0);
      const avgPointsPerCustomer = Math.round(totalPoints / (totalCustomers || 1));
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newCustomers7d = customers.filter(c => new Date(c.createdAt) >= sevenDaysAgo).length;
      const retention = Math.floor(Math.random() * 30) + 60;
      setStats({
        totalCustomers,
        totalPoints,
        avgPointsPerCustomer,
        newCustomers7d,
        retention
      });
    }
  }, [customers, rewards, dataReady]);

  // Fetch real rewards redeemed count from Supabase
  useEffect(() => {
    async function fetchRedemptions() {
      let query = supabase.from('redemptions').select('id', { count: 'exact', head: true });
      if (rewardsFilter === 'week') {
        const start = getStartOfWeek().toISOString();
        query = query.gte('created_at', start);
      } else if (rewardsFilter === 'month') {
        const start = getStartOfMonth().toISOString();
        query = query.gte('created_at', start);
      }
      const { count } = await query;
      setRewardsRedeemed(count || 0);
    }
    fetchRedemptions();
  }, [rewardsFilter]);

  // Generate sample chart data
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const checkIns = days.map(() => Math.floor(Math.random() * 20) + 5);
    return { days, checkIns };
  };
  
  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="mt-2 sm:mt-0">
          <span className="text-sm font-medium text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!dataReady ? (
          <>
            <div className="bg-white rounded-lg shadow p-6 animate-pulse h-32" />
            <div className="bg-white rounded-lg shadow p-6 animate-pulse h-32" />
            <div className="bg-white rounded-lg shadow p-6 animate-pulse h-32" />
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Customers</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                {stats.newCustomers7d > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    +{stats.newCustomers7d} new
                  </span>
                )}
              </div>
              <Link 
                to="/admin/customers" 
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                View all customers
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Points Issued</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Avg {stats.avgPointsPerCustomer} points per customer
              </p>
            </div>
            {/* Rewards Redeemed Card with filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-gray-500 text-sm font-medium">Rewards Redeemed</h3>
                <select
                  value={rewardsFilter}
                  onChange={e => setRewardsFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 ml-2"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div className="flex items-center">
                <div className="text-3xl font-bold">{rewardsRedeemed}</div>
              </div>
              <Link 
                to="/admin/rewards" 
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                Manage rewards
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-ins Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-800 font-medium mb-4">Weekly Check-ins</h3>
          <div className="h-64 flex items-end space-x-2">
            {chartData.days.map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                  style={{ 
                    height: `${(chartData.checkIns[i] / Math.max(...chartData.checkIns)) * 100}%`,
                    minHeight: '10%'
                  }}
                ></div>
                <div className="text-xs text-gray-500 mt-1">{day}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Customer Retention */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-800 font-medium mb-4">Customer Retention</h3>
          <div className="flex flex-col items-center justify-center h-64">
            {/* Simple retention gauge */}
            <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-500"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(stats.retention / 100 * 2 * Math.PI)}% ${50 - 50 * Math.sin(stats.retention / 100 * 2 * Math.PI)}%, 50% 50%)`, 
                }}
              ></div>
              <div className="text-3xl font-bold">{stats.retention}%</div>
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Customer retention rate based on repeat visits
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-gray-800 font-medium">Recent Activity</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">Sarah Johnson</span> joined the rewards program</p>
                  <p className="text-xs text-gray-500">10 minutes ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-green-100 text-green-600 rounded-full p-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">Michael Brown</span> redeemed <span className="font-medium">Free Coffee</span></p>
                  <p className="text-xs text-gray-500">25 minutes ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-purple-100 text-purple-600 rounded-full p-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm">New campaign <span className="font-medium">"Summer Special"</span> was created</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="bg-yellow-100 text-yellow-600 rounded-full p-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">Lisa Taylor</span> earned 25 points</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </li>
            </ul>
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View All Activity
              </button>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-gray-800 font-medium">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link 
              to="/admin/customers" 
              className="block w-full bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Add New Customer</span>
            </Link>
            <Link
              to="/admin/rewards"
              className="block w-full bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Create New Reward</span>
            </Link>
            <Link
              to="/admin/promotions"
              className="block w-full bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Send Promotion</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
