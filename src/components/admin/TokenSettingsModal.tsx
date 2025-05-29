import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings2, Coins } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { useGetTokenSettingsQuery, useUpdateTokenSettingsMutation } from '@/api/tokenSettingsApi';

interface TokenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

const TokenSettingsModal: React.FC<TokenSettingsModalProps> = ({ isOpen, onClose, isEmbedded = false }) => {
  const [settings, setSettings] = useState({
    creditsPerModelToken: '',
    creditsPerImageToken: '',
  });
  console.log("settings",settings)

  const { addToast } = useToast();
  const { data: currentSettings, isLoading: isLoadingSettings } = useGetTokenSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateTokenSettingsMutation();

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        creditsPerModelToken: currentSettings.creditsPerModelToken.toString(),
        creditsPerImageToken: currentSettings.creditsPerImageToken.toString(),
      });
    }
  }, [currentSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        creditsPerModelToken: parseInt(settings.creditsPerModelToken),
        creditsPerImageToken: parseInt(settings.creditsPerImageToken),
      }).unwrap();

      addToast(
        'Token settings updated successfully',
        ToastType.SUCCESS,
      );
      if (!isEmbedded) {
        onClose();
      }
    } catch (error: any) {
      addToast(
        error?.data?.message || 'Failed to update token settings',
        ToastType.ERROR,
      );
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6 px-1">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Model Token per Credits</Label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="creditsPerModelToken"
              type="number"
              value={settings.creditsPerModelToken}
              onChange={handleInputChange}
              placeholder="Enter model tokens per credit"
              className="pl-9 focus:border-amber-500 focus:ring-amber-200"
              required
            />
          </div>
          <p className="text-xs text-gray-500">Number of model tokens granted for one credit</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Image Token per Credits</Label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="creditsPerImageToken"
              type="number"
              value={settings.creditsPerImageToken}
              onChange={handleInputChange}
              placeholder="Enter image tokens per credit"
              className="pl-9 focus:border-amber-500 focus:ring-amber-200"
              required
            />
          </div>
          <p className="text-xs text-gray-500">Number of image tokens granted for one credit</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {!isEmbedded && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 min-w-[100px]"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Credits Tokens'
          )}
        </Button>
      </div>
    </form>
  );

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isEmbedded) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-t-lg -mt-4 -mx-4 mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-6 h-6" />
            Token Conversion Settings
          </DialogTitle>
          <DialogDescription className="text-amber-100 mt-1">
            Configure how many tokens are granted per credit
          </DialogDescription>
        </DialogHeader>

        {content}
      </DialogContent>
    </Dialog>
  );
};

export default TokenSettingsModal; 