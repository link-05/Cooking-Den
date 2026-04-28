import UrlInput from "@/app/components/url-input";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Cooked Den
          </h1>
          <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Paste any recipe URL. We strip the ads, save it forever, and add
            cost, nutrition, and cooking mode.
          </p>
        </div>

        <UrlInput />

        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Works with any recipe site — AllRecipes, NYT Cooking, Serious Eats,
          and more.
        </p>
      </div>
    </main>
  );
}
