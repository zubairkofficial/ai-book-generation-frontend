import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, DollarSign, Wallet } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useGetSystemSettingsQuery, useUpdateSystemSettingMutation } from '@/api/systemSettingsApi';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';

const SystemSettingsPage = () => {
    const { addToast } = useToast();
    const { data: settings, isLoading, refetch } = useGetSystemSettingsQuery();
    const [updateSetting, { isLoading: isUpdating }] = useUpdateSystemSettingMutation();

    // Local state for form values to allow editing
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

    // Initialize form values when data is loaded
    // We use a useEffect or derived state approach. 
    // Since we need to edit, we'll sync state when settings load.
    if (settings && Object.keys(formValues).length === 0 && !changedFields.size) {
        const initialValues: Record<string, string> = {};
        settings.forEach(s => initialValues[s.key] = s.value);
        setFormValues(initialValues);
    }

    const handleChange = (key: string, value: string) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
        setChangedFields(prev => new Set(prev).add(key));
    };

    const handleSave = async (key: string) => {
        try {
            await updateSetting({ key, value: formValues[key] }).unwrap();
            addToast('Setting updated successfully', ToastType.SUCCESS);
            setChangedFields(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
            refetch();
        } catch (error: any) {
            addToast('Failed to update setting', ToastType.ERROR);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-[80vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                </div>
            </Layout>
        );
    }

    const getIcon = (key: string) => {
        if (key === 'INITIAL_PAYMENT_FEE') return <DollarSign className="h-5 w-5 text-green-500" />;
        if (key === 'DEFAULT_INITIAL_CREDIT') return <Wallet className="h-5 w-5 text-blue-500" />;
        return <Settings className="h-5 w-5 text-gray-500" />;
    };

    const getLabel = (key: string) => {
        if (key === 'INITIAL_PAYMENT_FEE') return 'Initial Registration Fee ($)';
        if (key === 'DEFAULT_INITIAL_CREDIT') return 'Default Initial User Credit ($)';
        return key.replace(/_/g, ' ');
    };

    return (
        <Layout>
            <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Settings className="w-8 h-8 text-amber-500" />
                            System Configuration
                        </h1>
                        <p className="text-gray-500">
                            Manage global settings for the application. Changes affect all new users/transactions immediately.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {settings?.map((setting) => (
                            <Card key={setting.key}>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        {getIcon(setting.key)}
                                        <CardTitle className="text-lg">{getLabel(setting.key)}</CardTitle>
                                    </div>
                                    <CardDescription>{setting.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4 items-end">
                                        <div className="grid gap-2 flex-grow">
                                            <Label htmlFor={setting.key}>Value</Label>
                                            <Input
                                                id={setting.key}
                                                value={formValues[setting.key] ?? setting.value}
                                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                                type="number"
                                            />
                                        </div>
                                        <Button
                                            onClick={() => handleSave(setting.key)}
                                            disabled={!changedFields.has(setting.key) || isUpdating}
                                            className="mb-0.5"
                                        >
                                            {isUpdating && changedFields.has(setting.key) ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default SystemSettingsPage;
