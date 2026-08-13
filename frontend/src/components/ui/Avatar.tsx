interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
}

export function Avatar({ name, src, size = 32 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const style = { width: size, height: size };

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="rounded-full object-cover border border-line"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-neutral-800 text-white font-medium"
    >
      {initial}
    </div>
  );
}
