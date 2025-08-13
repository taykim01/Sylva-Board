import { generateMissingEmbeddings } from "@/features/ai-chat-features";

/**
 * Hook to manage background embedding generation
 */
export function useEmbeddingPopulation() {
  const populateUserEmbeddings = async (userId: string) => {
    try {
      console.log("Starting background embedding population...");
      const result = await generateMissingEmbeddings(userId);

      if (result.processed > 0) {
        console.log(`Embedding population completed: ${result.success}/${result.processed} successful`);

        if (result.errors.length > 0) {
          console.warn("Some embeddings failed to generate:", result.errors);
        }
      }

      return result;
    } catch (error) {
      console.error("Failed to populate embeddings:", error);
      return { processed: 0, success: 0, errors: ["Failed to start embedding population"] };
    }
  };

  return { populateUserEmbeddings };
}
