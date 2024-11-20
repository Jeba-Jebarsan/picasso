"use client";

import GithubIcon from "../app/components/icons/github-icon";
import XIcon from "@/app/components/icons/x-icon";
import Logo from "@/app/components/logo";
import Spinner from "@/app/components/spinner";
import imagePlaceholder from "@/public/image-placeholder.png";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

type ImageResponse = {
  b64_json: string;
  timings: { inference: number };
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [iterativeMode, setIterativeMode] = useState(false);
  const [userAPIKey, setUserAPIKey] = useState("");
  const debouncedPrompt = useDebounce(prompt, 300);
  const [generations, setGenerations] = useState<
    { prompt: string; image: ImageResponse }[]
  >([]);
  let [activeIndex, setActiveIndex] = useState<number>();

  const { data: image, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
    queryKey: [debouncedPrompt],
    queryFn: async () => {
      let res = await fetch("/api/generateImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, userAPIKey, iterativeMode }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as ImageResponse;
    },
    enabled: !!debouncedPrompt.trim(),
    staleTime: Infinity,
    retry: false,
  });

  let isDebouncing = prompt !== debouncedPrompt;

  useEffect(() => {
    if (image && !generations.map((g) => g.image).includes(image)) {
      setGenerations((images) => [...images, { prompt, image }]);
      setActiveIndex(generations.length);
    }
  }, [generations, image, prompt]);

  let activeImage =
    activeIndex !== undefined ? generations[activeIndex].image : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center py-8">
          <div className="flex-1">
            <a href="/" className="text-4xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
              Picasso
            </a>
          </div>
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-200">
              [Optional] Add your{" "}
              <a
                href="https://api.together.xyz/settings/api-keys"
                target="_blank"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Together API Key
              </a>
            </label>
            <Input
              placeholder="API Key"
              type="password"
              value={userAPIKey}
              className="mt-1 bg-opacity-20 bg-black backdrop-blur-sm border-violet-700 text-white placeholder-gray-400"
              onChange={(e) => setUserAPIKey(e.target.value)}
            />
          </div>
        </header>

        <main className="py-12">
          <form className="max-w-2xl mx-auto">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <Textarea
                rows={4}
                spellCheck={false}
                placeholder="Let your imagination run wild..."
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full resize-none bg-opacity-20 bg-black backdrop-blur-sm border-violet-700 text-white placeholder-gray-400 focus:ring-violet-500 focus:border-violet-500"
              />
              <div className={`${isFetching || isDebouncing ? "flex" : "hidden"} absolute bottom-3 right-3`}>
                <Spinner className="h-5 w-5 text-violet-500" />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setIterativeMode(!iterativeMode)}
                className={`${iterativeMode ? 'bg-violet-700' : 'bg-violet-900/50'} hover:bg-violet-800/50 text-white border-violet-700`}
              >
                Consistency mode {iterativeMode ? 'ON' : 'OFF'}
              </Button>
            </div>
          </form>

          <div className="mt-16 text-center">
            {!activeImage || !prompt ? (
              <div className="max-w-3xl mx-auto">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Create Masterpieces with AI
                </h1>
                <p className="mt-6 text-xl text-gray-200">
                  Transform your words into stunning visuals instantly. Experience the magic of AI-powered artistry.
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="rounded-xl overflow-hidden shadow-2xl ring-2 ring-violet-500/20">
                  <Image
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    width={1024}
                    height={768}
                    src={`data:image/png;base64,${activeImage.b64_json}`}
                    alt=""
                    className={`${isFetching ? "animate-pulse" : ""} w-full object-cover`}
                  />
                </div>

                <div className="mt-8 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {generations.map((generatedImage, i) => (
                    <button
                      key={i}
                      className="flex-shrink-0 w-32 transform transition-all duration-200 hover:scale-105 focus:outline-none hover:ring-2 hover:ring-violet-500"
                      onClick={() => setActiveIndex(i)}
                    >
                      <Image
                        placeholder="blur"
                        blurDataURL={imagePlaceholder.blurDataURL}
                        width={1024}
                        height={768}
                        src={`data:image/png;base64,${generatedImage.image.b64_json}`}
                        alt=""
                        className="rounded-lg shadow-lg"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="py-12 border-t border-violet-800/30">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex space-x-4">
              <a href="https://github.com/Nutlope/blinkshot" target="_blank">
                <Button
                  className="bg-violet-900/50 hover:bg-violet-800/50 text-white border-violet-700"
                >
                  <GithubIcon className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </a>
              <a href="https://x.com/nutlope" target="_blank">
                <Button
                  className="bg-violet-900/50 hover:bg-violet-800/50 text-white border-violet-700"
                >
                  <XIcon className="h-3 w-3 mr-2" />
                  Twitter
                </Button>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
