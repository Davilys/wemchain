import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function PoliticaPrivacidade() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      const { data } = await supabase
        .from("legal_documents")
        .select("content")
        .eq("document_type", "privacy_policy")
        .eq("is_active", true)
        .maybeSingle();

      if (data) {
        setContent(data.content);
      }
      setLoading(false);
    }

    fetchDocument();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="font-display text-2xl">Política de Privacidade</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
