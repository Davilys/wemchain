import { Layout } from "@/components/layout/Layout";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogTargetAudience } from "@/components/blog/BlogTargetAudience";

export default function Blog() {
  return (
    <Layout>
      <BlogHero />
      <BlogGrid />
      <BlogTargetAudience />
    </Layout>
  );
}
