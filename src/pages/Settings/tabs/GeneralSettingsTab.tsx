import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";
import { ToastType } from "@/constant";
import { useFetchSettingsQuery, useUpdateSettingsMutation } from "@/api/settingsApi";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";

export const GeneralSettingsTab = () => {
    const { data: settings, refetch } = useFetchSettingsQuery();
    const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
    const { addToast } = useToast();

    const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);

    useEffect(() => {
        if (settings) {
            setEmailVerificationEnabled(settings.emailVerificationEnabled ?? true);
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            await updateSettings({
                emailVerificationEnabled,
            }).unwrap();

            addToast("General settings updated successfully", ToastType.SUCCESS);
            refetch();
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
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="email-verification" className="text-base font-medium text-gray-900">
                                    Email Verification
                                </Label>
                                <p className="text-sm text-gray-500">
                                    When enabled, new users must verify their email address before logging in.
                                    When disabled, users are automatically verified upon registration.
                                </p>
                            </div>
                            <Switch
                                id="email-verification"
                                checked={emailVerificationEnabled}
                                onCheckedChange={setEmailVerificationEnabled}
                            />
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
