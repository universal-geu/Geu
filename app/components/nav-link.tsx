import Link from "next/link";
import type { ComponentProps } from "react";

// /grupo-geu redirige a otro dominio (www.geu-universal.com) cuando se está en
// el dominio de una unidad. La navegación cliente de <Link> no sigue esa
// redirección entre dominios, así que ese enlace va como <a> normal.
export const GEU_HOME_HREF = "/grupo-geu";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export default function NavLink({ href, prefetch: _prefetch, replace: _replace, scroll: _scroll, ...props }: NavLinkProps) {
  if (href === GEU_HOME_HREF) {
    return <a href={href} {...(props as ComponentProps<"a">)} />;
  }
  return <Link href={href} prefetch={_prefetch} replace={_replace} scroll={_scroll} {...props} />;
}
