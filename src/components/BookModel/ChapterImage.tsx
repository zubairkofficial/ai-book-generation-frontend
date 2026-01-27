import React, { useState } from "react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input"; // Assuming you have an input component
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea"; // Assuming you have a textarea component
import {
    RotateCw,
    Upload,
    Image as ImageIcon,
    Loader2,
    Check,
    X,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ChapterImageProps {
    src: string;
    alt: string;
    onRegenerate: (newPrompt?: string) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
}

export const ChapterImage: React.FC<ChapterImageProps> = ({
    src,
    alt,
    onRegenerate,
    onUpload,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
    const [regeneratePrompt, setRegeneratePrompt] = useState("");
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleRegenerateClick = () => {
        setShowRegenerateDialog(true);
        setRegeneratePrompt("");
    };

    const confirmRegenerate = async () => {
        try {
            setIsRegenerating(true);
            await onRegenerate(regeneratePrompt);
            setShowRegenerateDialog(false);
        } catch (error) {
            console.error("Regeneration failed", error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            await onUpload(file);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div
            className="relative group rounded-lg overflow-hidden my-6 border border-gray-200 shadow-sm"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative">
                <img
                    src={src}
                    alt={alt}
                    className={cn(
                        "w-full h-auto object-cover max-h-[500px] transition-all duration-300",
                        (isRegenerating || isUploading) && "opacity-50 blur-[2px]"
                    )}
                />
                {(isRegenerating || isUploading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                            <span className="font-medium text-amber-800">
                                {isRegenerating ? "Regenerating..." : "Uploading..."}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-200",
                    isHovered && !isRegenerating && !isUploading
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                )}
            >
                <Button
                    onClick={handleRegenerateClick}
                    className="bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2"
                >
                    <RotateCw className="w-4 h-4" />
                    Regenerate
                </Button>
                <Button
                    onClick={handleUploadClick}
                    className="bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Upload Replace
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                />
            </div>

            {/* Regenerate Dialog */}
            <Dialog
                open={showRegenerateDialog}
                onOpenChange={setShowRegenerateDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Regenerate Image</DialogTitle>
                        <DialogDescription>
                            Provide optional instructions to guide the new image generation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label>Instruction / Style (Optional)</Label>
                            <Textarea
                                placeholder="e.g., Make it darker, use watercolor style..."
                                value={regeneratePrompt}
                                onChange={(e) => setRegeneratePrompt(e.target.value)}
                                className="mt-1.5"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowRegenerateDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmRegenerate}
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                <RotateCw className="w-4 h-4 mr-2" />
                                Generate New Image
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
