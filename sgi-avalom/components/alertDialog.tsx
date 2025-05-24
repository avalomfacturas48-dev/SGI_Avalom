import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ClientAlertDialogProps {
  title: string;
  description: string;
  triggerText: string;
  cancelText: string;
  actionText: string;
  onAction: () => void;
  onCancel?: () => void;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "green"
    | "orange"
    | null
    | undefined;
  classn?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const ClientAlertDialog: React.FC<ClientAlertDialogProps> = ({
  title,
  description,
  triggerText,
  cancelText,
  actionText,
  onAction,
  onCancel,
  variant,
  classn,
  icon,
  disabled,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} disabled={disabled} className={classn}>{icon}{triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>{actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClientAlertDialog;
