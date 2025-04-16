
import { toast } from 'sonner';

export const validateImage = (file: File): boolean => {
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return false;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image size should be less than 5MB');
    return false;
  }
  
  return true;
};
