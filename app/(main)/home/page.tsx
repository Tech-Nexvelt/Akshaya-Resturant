import { redirect } from "next/navigation";
import { isValidService, type ServiceType } from "@/lib/service-config";

interface HomePageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const targetService = params.service;

  if (targetService && isValidService(targetService)) {
    redirect(`/${targetService}`);
  }

  redirect("/restaurant");
}
