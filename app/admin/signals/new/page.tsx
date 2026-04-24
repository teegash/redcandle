import { SignalForm } from "@/components/admin/signal-form";

export const metadata = {
  title: "New Signal",
};

export default function NewSignalPage() {
  return (
    <div className="py-8">
      <SignalForm />
    </div>
  );
}
