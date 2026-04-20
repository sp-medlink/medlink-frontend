"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type UIEventHandler,
} from "react";
import { ArrowDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Compound chat shell. Splits into four slot components:
 *
 *   <Chat>
 *     <Chat.Header>…</Chat.Header>
 *     <Chat.Content>…</Chat.Content>
 *     <Chat.Footer>…</Chat.Footer>
 *   </Chat>
 *
 * `Chat.Content` is scrollable and owns the jump-to-latest affordance
 * so composers don't have to reinvent the sticky-pill logic. Styling
 * is opinionated (dark surface, small text) but every slot accepts a
 * `className` override for one-off tweaks.
 */

type RootProps = HTMLAttributes<HTMLElement>;
type HeaderProps = HTMLAttributes<HTMLElement>;
type FooterProps = HTMLAttributes<HTMLElement>;

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  onScroll?: UIEventHandler<HTMLDivElement>;
  /** Optional overlay rendered *inside* the scroll wrapper (e.g. jump-to-latest pill). */
  overlay?: ReactNode;
}

function Root({ className, children, ...rest }: RootProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

function Header({ className, children, ...rest }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-2 border-b bg-background px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-3",
        className,
      )}
      {...rest}
    >
      {children}
    </header>
  );
}

/**
 * Scrollable body slot. We wrap the scroll node in a `relative` parent
 * so the jump-to-latest pill (passed via `overlay`) can pin itself to
 * the bottom without leaving the content box.
 */
const Content = forwardRef<HTMLDivElement, ContentProps>(function Content(
  { className, children, onScroll, overlay, ...rest },
  ref,
) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={ref}
        onScroll={onScroll}
        className={cn(
          "scrollbar-none min-h-0 flex-1 overflow-y-auto bg-background px-3 py-3",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
      {overlay}
    </div>
  );
});

function Footer({ className, children, ...rest }: FooterProps) {
  return (
    <footer
      className={cn(
        "shrink-0 border-t bg-background px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
        className,
      )}
      {...rest}
    >
      {children}
    </footer>
  );
}

/**
 * Inline "Today" / "Yesterday" / date separator sitting between
 * message bubbles. Rendering is trivial but centralising it here keeps
 * bubble callers consistent.
 */
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

interface JumpToLatestProps {
  count: number;
  onClick: () => void;
}

/**
 * Floating pill that appears above the composer when new messages
 * arrive while the user has scrolled up. Rendered inside
 * `Chat.Content overlay` so it's positioned relative to the scroll area.
 */
function JumpToLatest({ count, onClick }: JumpToLatestProps) {
  if (count <= 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition hover:bg-emerald-500"
    >
      <ArrowDown className="size-3.5" aria-hidden />
      {count} new message{count === 1 ? "" : "s"}
    </button>
  );
}

export const Chat = Object.assign(Root, {
  Header,
  Content,
  Footer,
  DateSeparator,
  JumpToLatest,
});
