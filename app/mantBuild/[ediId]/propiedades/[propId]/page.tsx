import BodyPropertyDetail from "@/components/mantBuild/mantProperty/BodyPropertyDetail";

interface PageProps {
  params: Promise<{ ediId: string; propId: string }>;
}

export default async function page({ params }: PageProps) {
  const { ediId, propId } = await params;
  return <BodyPropertyDetail ediId={ediId} propId={propId} />;
}
