import { Suspense } from "react";
import Spinner from "@/components/common/spinner";
import { DataLoader } from "./data-loader";
import { DashboardContent } from "./dashboard-content";
import { BaseOverlay } from "@/components/base/base-overlay";

export default async function Page() {

  return (
    <Suspense fallback={<Spinner />}>
      <DashboardContent />
      <DataLoader />
      <BaseOverlay />
    </Suspense>
  );
}
