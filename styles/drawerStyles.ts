import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0, // SafeAreaView will handle the status bar offset
    bottom: 0,
    width: width * 0.7,
    borderTopRightRadius: 24, // Increased for premium look
    borderBottomRightRadius: 24, // Increased for premium look
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 }, // Enhanced shadow
    shadowOpacity: 0.3, // Enhanced shadow
    shadowRadius: 8, // Enhanced shadow
    elevation: 8, // Enhanced shadow for Android
    zIndex: 900, // Below screen overlays (1000-1001) to prevent flicker
    borderRightWidth: 0, // Remove border for cleaner look
    overflow: 'hidden', // Ensure border radius is properly applied
  },
  safeArea: {
    flex: 1,
  },
  drawerHeader: {
    paddingTop: 0, // Reduced to move profile closer to status bar
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8, // Reduced to move profile image higher
  },
  placeholder: {
    width: 40, // Same width as back button to center the title
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -12, // Move profile section up even more
    marginBottom: 16, // Add space between profile image and menu items
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileEmoji: {
    fontSize: 45,
  },
  profileImageSource: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0097b2',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8, // Reduced since we added marginBottom to profileSection
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 18 for less padding
    borderBottomWidth: 0.5, // Thinner border for premium look
    marginHorizontal: 8, // Add margin for premium spacing
    borderRadius: 12, // Add subtle border radius
    marginVertical: 3, // Increased from 1 for more spacing between items
  },
  menuIcon: {
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  deleteText: {
    color: '#dc3545',
  },
  menuArrow: {
    fontSize: 18,
    opacity: 0.6,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    borderRadius: 12, // Reduced for smaller button
    paddingVertical: 12, // Reduced for smaller button
    alignItems: 'center',
    marginHorizontal: 20, // Increased margin for smaller button
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.2, // Reduced shadow
    shadowRadius: 4, // Reduced shadow
    elevation: 3, // Reduced shadow for Android
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14, // Reduced font size
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: 8, // Reduced from 20 to 8 for much smaller space
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  versionText: {
    fontSize: 8, // Reduced from 10 to 8 for smaller text
    color: '#999',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 899, // Below drawer but above main content
  },
});
