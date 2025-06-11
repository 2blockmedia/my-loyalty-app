import useTabletOrientation from './useTabletOrientation';
import PINEntryScreen from './PINEntryScreen';
import StoreTabletView from './StoreTabletView';
import CustomerTabletView from './CustomerTabletView';

const TabletLayout = () => {
  const { viewMode, isLocked, unlockStoreMode } = useTabletOrientation();

  if (viewMode === 'store') {
    return isLocked ? (
      <PINEntryScreen onUnlock={unlockStoreMode} />
    ) : (
      <StoreTabletView />
    );
  } else {
    return <CustomerTabletView />;
  }
};

export default TabletLayout;
