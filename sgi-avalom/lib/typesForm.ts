export interface RentalFormProps {
    action: "create" | "edit" | "view";
    onSuccess: () => void;
  }