import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectorTag } from "@/components/sectors/sector-tag";
import { SECTORS } from "@/components/sectors/sectors";
import { PasswordInput } from "@/components/ui/password-input";


const visibilityLabels = { show: "Show password", hide: "Hide password" };

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[36rem] flex-col gap-8 p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-m font-semibold">UI kit</h1>
        <Link className="text-sx text-primary underline" href="/code">
          /code
        </Link>
      </header>

      <section className="glassmorphism flex flex-col gap-6 rounded-m p-8">
        <h2 className="text-sm font-medium">.glassmorphism</h2>

        <Input
          placeholder="Input (unstyled base)"
          className="rounded-sm border border-white/40 bg-black/10 px-4 py-2.5"
          inputClassName="h-7 text-lg placeholder:text-white/40"
        />
        <PasswordInput label="Password" visibilityLabels={visibilityLabels} />
        <PasswordInput
          label="Password with error"
          defaultValue="secret"
          errorMessage="This password is too short."
          visibilityLabels={visibilityLabels}
        />

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg" alignment="center" textSize="base">
            Primary
          </Button>
          <Button variant="primary" size="lg" alignment="center" textSize="base" isLoading>
            Loading
          </Button>
          <Button variant="primary" size="lg" alignment="center" textSize="base" disabled>
            Disabled
          </Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Button variant="ghostLight">ghostLight</Button>
          <Button variant="ghostMedium">ghostMedium</Button>
          <Button variant="ghostDark">ghostDark</Button>
          <Button variant="ghostMonochrome">ghostMonochrome</Button>
        </div>
      </section>

      <section className="glassmorphism flex flex-col gap-6 rounded-m p-8">
        <h2 className="text-sm font-medium">SectorTag</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {SECTORS.slice(0, 6).map((sector) => (
            <SectorTag
              key={sector}
              sector={sector}
              label={sector}
              variant="empty-large"
              isMonochrome
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => (
            <SectorTag
              key={sector}
              sector={sector}
              label={sector}
              variant="empty-large"
              bg="light-dim"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
