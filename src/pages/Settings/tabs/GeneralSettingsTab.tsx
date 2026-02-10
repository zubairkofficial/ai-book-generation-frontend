import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";
import { ToastType } from "@/constant";
import { useFetchSettingsQuery, useUpdateSettingsMutation } from "@/api/settingsApi";
import { useGetSystemSettingsQuery, useUpdateSystemSettingMutation } from "@/api/systemSettingsApi";
import { Settings as SettingsIcon, Save, Loader2, Coins, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

export const GeneralSettingsTab = () => {
    const { data: settings, refetch } = useFetchSettingsQuery();
    const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
    const { addToast } = useToast();

    const { data: systemSettings, refetch: refetchSystem } = useGetSystemSettingsQuery();
    const [updateSystemSetting] = useUpdateSystemSettingMutation();
    const [paymentAmount, setPaymentAmount] = useState("");
    const [creditAmount, setCreditAmount] = useState("");

    useEffect(() => {
        if (systemSettings) {
            const paymentSetting = systemSettings.find(s => s.key === 'INITIAL_PAYMENT_AMOUNT');
            const creditSetting = systemSettings.find(s => s.key === 'INITIAL_CREDIT_AMOUNT');
            if (paymentSetting) setPaymentAmount(paymentSetting.value);
            if (creditSetting) setCreditAmount(creditSetting.value);
        }
    }, [systemSettings]);

    const handleSave = async () => {
        try {
            const promises = [
                updateSettings({
                    // emailVerificationEnabled removed
                }).unwrap(),
                updateSystemSetting({ key: 'INITIAL_PAYMENT_AMOUNT', value: paymentAmount }).unwrap(),
                updateSystemSetting({ key: 'INITIAL_CREDIT_AMOUNT', value: creditAmount }).unwrap()
            ];

            await Promise.all(promises);

            addToast("General settings updated successfully", ToastType.SUCCESS);
            refetch();
            refetchSystem();
        } catch (error: any) {
            addToast(error?.data?.message || "Failed to update settings", ToastType.ERROR);
        }
    };

    return (
        <div className="animate-in fade-in-50 duration-500">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            General Settings
                        </h2>
                    </div>
                    <p className="text-sm text-gray-600 ml-[52px]">
                        Manage general application behavior and features
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex flex-col space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="payment-amount" className="text-base font-medium text-gray-900 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-amber-500" />
                                        Initial Payment Amount ($)
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-2">
                                        The mandatory setup fee new users must pay before their account is reviewed.
                                    </p>
                                    <Input
                                        id="payment-amount"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="max-w-[200px]"
                                    />
                                </div>

                                <div className="grid gap-2 pt-4">
                                    <Label htmlFor="credit-amount" className="text-base font-medium text-gray-900 flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                        Initial Credit Amount ($)
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-2">
                                        The amount of credit automatically granted to a user upon account approval.
                                    </p>
                                    <Input
                                        id="credit-amount"
                                        type="number"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(e.target.value)}
                                        placeholder="e.g. 100"
                                        className="max-w-[200px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <Button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
