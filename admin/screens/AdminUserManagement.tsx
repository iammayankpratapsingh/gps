import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdmin } from '../contexts/AdminContext';
import AdminHeader from '../components/AdminHeader';
import { AdminUser } from '../types';

interface AdminUserManagementProps {
  onNavigate?: (screen: string) => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ onNavigate }) => {
  const {
    theme,
    users,
    isLoading,
    refreshUsers,
    updateUserRole,
    deleteUser,
    toggleDrawer
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'superadmin'>('user');

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleRoleChange = (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    try {
      const success = await updateUserRole(selectedUser.uid, selectedRole);
      if (success) {
        Alert.alert('Success', 'User role updated successfully');
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        Alert.alert('Error', 'Failed to update user role');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating user role');
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.displayName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteUser(user.uid);
              if (success) {
                Alert.alert('Success', 'User deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete user');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting user');
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return theme.error;
      case 'admin':
        return theme.warning;
      default:
        return theme.textSecondary;
    }
  };

  const UserCard: React.FC<{ user: AdminUser }> = ({ user }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handleUserPress(user)}
      activeOpacity={0.7}
    >
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          {user.profileImageUrl ? (
            <Text style={[styles.avatarText, { color: theme.drawerText }]}>
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Icon name="person" size={24} color={theme.drawerText} />
          )}
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            {user.displayName}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]} numberOfLines={1}>
            {user.email}
          </Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
              <Text style={[styles.roleText, { color: theme.drawerText }]}>
                {user.role.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.lastLogin, { color: theme.textSecondary }]}>
              Last login: {user.lastLoginAt.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => handleRoleChange(user)}
          activeOpacity={0.7}
        >
          <Icon name="edit" size={16} color={theme.drawerText} />
        </TouchableOpacity>
        {user.role !== 'superadmin' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={() => handleDeleteUser(user)}
            activeOpacity={0.7}
          >
            <Icon name="delete" size={16} color={theme.drawerText} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AdminHeader
        title="User Management"
        onMenuPress={toggleDrawer}
        showBackButton={true}
        onBackPress={() => onNavigate?.('AdminDashboard')}
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search users..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => <UserCard user={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* User Details Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <AdminHeader
            title="User Details"
            onMenuPress={toggleDrawer}
            showBackButton={true}
            onBackPress={() => setShowUserModal(false)}
          />
          {selectedUser && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.userDetailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.userDetailHeader}>
                  <View style={[styles.largeAvatar, { backgroundColor: theme.primary }]}>
                    {selectedUser.profileImageUrl ? (
                      <Text style={[styles.largeAvatarText, { color: theme.drawerText }]}>
                        {selectedUser.displayName.charAt(0).toUpperCase()}
                      </Text>
                    ) : (
                      <Icon name="person" size={40} color={theme.drawerText} />
                    )}
                  </View>
                  <Text style={[styles.largeUserName, { color: theme.text }]}>
                    {selectedUser.displayName}
                  </Text>
                  <Text style={[styles.largeUserEmail, { color: theme.textSecondary }]}>
                    {selectedUser.email}
                  </Text>
                  <View style={[styles.largeRoleBadge, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                    <Text style={[styles.largeRoleText, { color: theme.drawerText }]}>
                      {selectedUser.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.userDetailInfo}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>User ID:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedUser.uid}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Created:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedUser.createdAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Last Login:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedUser.lastLoginAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Status:</Text>
                    <Text style={[styles.detailValue, { color: selectedUser.isActive ? theme.success : theme.error }]}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.roleModalOverlay}>
          <View style={[styles.roleModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.roleModalTitle, { color: theme.text }]}>
              Change User Role
            </Text>
            <Text style={[styles.roleModalSubtitle, { color: theme.textSecondary }]}>
              Select a new role for {selectedUser?.displayName}
            </Text>
            {['user', 'admin', 'superadmin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  { borderColor: theme.border },
                  selectedRole === role && { backgroundColor: theme.primary }
                ]}
                onPress={() => setSelectedRole(role as 'user' | 'admin' | 'superadmin')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.roleOptionText,
                  { color: selectedRole === role ? theme.drawerText : theme.text }
                ]}>
                  {role.toUpperCase()}
                </Text>
                {selectedRole === role && (
                  <Icon name="check" size={20} color={theme.drawerText} />
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.roleModalActions}>
              <TouchableOpacity
                style={[styles.roleModalButton, { backgroundColor: theme.border }]}
                onPress={() => setShowRoleModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleModalButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleModalButton, { backgroundColor: theme.primary }]}
                onPress={confirmRoleChange}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleModalButtonText, { color: theme.drawerText }]}>
                  Update Role
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  lastLogin: {
    fontSize: 12,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  userDetailCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  userDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: '600',
  },
  largeUserName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  largeUserEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  largeRoleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  largeRoleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userDetailInfo: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  roleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roleModal: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleModalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  roleModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  roleModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminUserManagement;
