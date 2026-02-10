import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PlusCircle, Check, X, Search, Shield, User, Filter, DollarSign } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetUsersQuery, useCreateUserMutation, useApproveUserMutation, useRejectUserMutation } from '@/api/adminApi';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { Badge } from '@/components/ui/badge';
import { CreateUserModal } from '@/components/admin/CreateUserModal';


const UserManagementPage = () => {
    const { addToast } = useToast();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // API Hooks
    const { data: userData, isLoading: isUsersLoading, refetch } = useGetUsersQuery({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined
    });

    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
    const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [userToRejectId, setUserToRejectId] = useState<number | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleCreateUser = async (data: any) => {
        try {
            await createUser(data).unwrap();
            addToast("User created successfully", ToastType.SUCCESS);
            setIsCreateModalOpen(false);
            refetch();
        } catch (error: any) {
            addToast(error.data?.message || "Failed to create user", ToastType.ERROR);
        }
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        try {
            await approveUser({ id }).unwrap();
            addToast("User approved successfully", ToastType.SUCCESS);
            refetch();
        } catch (error: any) {
            addToast(error.data?.message || "Failed to approve user", ToastType.ERROR);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = window.prompt("Please enter the reason for rejection:");
        if (reason === null) return; // User cancelled

        setProcessingId(id);
        try {
            console.log("Rejecting user", id, "with reason:", reason);
            await rejectUser({ id, reason: reason || "No reason provided" }).unwrap();
            addToast("User rejected successfully", ToastType.SUCCESS);
            refetch();
        } catch (error: any) {
            console.error("Reject error:", error);
            addToast(error.data?.message || "Failed to reject user", ToastType.ERROR);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
            case 'PENDING_APPROVAL':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending Approval</Badge>;
            case 'PENDING_PAYMENT':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Pending Payment</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Layout>
            <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-amber-500" />
                                    User Management
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Manage users, approvals, and permissions.</p>
                            </div>
                            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-10 border-gray-200 focus:border-amber-300 focus:ring-amber-200"
                                    disabled
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">(Coming Soon)</span>
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4 text-gray-400" />
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-0">
                        {isUsersLoading ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userData?.data.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-gray-50/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                    <span className="text-gray-500 text-sm">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-green-600 font-medium">
                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                    {user.availableAmount || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.status === 'PENDING_APPROVAL' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-green-500 hover:bg-green-600 h-8"
                                                            onClick={() => handleApprove(Number(user.id))}
                                                            disabled={processingId === Number(user.id)}
                                                        >
                                                            {processingId === Number(user.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                            <span className="ml-2 hidden sm:inline">Approve</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => handleReject(Number(user.id))}
                                                            disabled={processingId === Number(user.id)}
                                                        >
                                                            {processingId === Number(user.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                            <span className="ml-2 hidden sm:inline">Reject</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {userData?.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                                No users found matching the current filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    {/* Pagination - Simplified */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                        <span className="text-sm text-gray-500">
                            Page {page} of {userData?.meta.totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(userData?.meta.totalPages || 1, p + 1))}
                                disabled={page === (userData?.meta.totalPages || 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateUser}
                isLoading={isCreating}
            />
        </Layout>
    );
};

export default UserManagementPage;
