import { ExpedienteView } from "@/views/expediente";

interface PageProps {
  searchParams: Promise<{ doc?: string; docType?: string; name?: string }>;
}

export default async function ExpedientePage({ searchParams }: PageProps) {
  const { doc, docType, name } = await searchParams;
  return <ExpedienteView doc={doc} docType={docType} name={name} />;
}
