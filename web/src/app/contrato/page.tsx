import { ContratoView } from "@/views/contrato";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ContratoPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  return <ContratoView contractId={id} />;
}
