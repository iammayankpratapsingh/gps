import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 48,
  },
  listGridButton: {
    padding: 6,
    borderRadius: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listGridIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 10,
    minHeight: 36,
    zIndex: 10001, // Higher than dropdown to stay visible
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    padding: 6,
    borderRadius: 4,
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  threeDotsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    width: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginVertical: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
    zIndex: 10002, // Highest z-index to stay above everything
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  dropdownBackdrop: {
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dropdownHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownItemContent: {
    flex: 1,
    marginRight: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dropdownItemSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  dropdownStatusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  dropdownStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dropdownEmptyState: {
    padding: 20,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
