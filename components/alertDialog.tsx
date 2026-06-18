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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  actionDestructive?: boolean;
  classn?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Cuando es true no se renderiza el botón disparador y el diálogo queda
   * controlado por `open`/`onOpenChange`. Permite abrir la confirmación desde
   * un item de menú sin anidar el AlertDialog dentro del DropdownMenu.
   */
  hideTrigger?: boolean;
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
  actionDestructive,
  classn,
  icon,
  disabled,
  open: openProp,
  onOpenChange,
  hideTrigger,
}) => {
  const open = onOpenChange !== undefined ? !!openProp : undefined;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <AlertDialogTrigger asChild>
          <Button variant={variant} disabled={disabled} className={classn}>
            {icon}
            {triggerText}
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onAction}
            className={cn(
              actionDestructive &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClientAlertDialog;
