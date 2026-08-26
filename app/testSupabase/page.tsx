import { createClient } from "../../backend/lib/supabase/client";

export default async function TestSupabase() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">Supabase Error</h1>
        <p className="mt-4">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">
        Supabase Connection Test
      </h1>

      <pre className="mt-6 rounded-lg bg-gray-100 p-6">
        {JSON.stringify(products, null, 2)}
      </pre>
    </main>
  );
}