export interface AvatarPalette {
  start: string;
  middle: string;
  end: string;
}

export const DEFAULT_AVATAR_PALETTE: AvatarPalette = {
  start: "#dbeafe",
  middle: "#e9e7f8",
  end: "#fce7df",
};

function softenColor(red: number, green: number, blue: number): string {
  // Mezcla cada color con blanco para conseguir un resultado suave.
  const softness = 0.56;

  const r = Math.round(red + (255 - red) * softness);
  const g = Math.round(green + (255 - green) * softness);
  const b = Math.round(blue + (255 - blue) * softness);

  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Extrae una paleta aproximada de tres zonas horizontales
 * de la fotografía del avatar.
 *
 * Si la imagen no puede analizarse por CORS, formato o carga,
 * devuelve la paleta predeterminada sin bloquear la interfaz.
 */
export function extractAvatarPalette(src: string): Promise<AvatarPalette> {
  if (typeof window === "undefined") {
    return Promise.resolve(DEFAULT_AVATAR_PALETTE);
  }

  return new Promise((resolve) => {
    const image = new window.Image();

    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!context) {
          resolve(DEFAULT_AVATAR_PALETTE);
          return;
        }

        const width = 36;
        const height = 36;

        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, 0, 0, width, height);

        const pixels = context.getImageData(0, 0, width, height).data;

        const zones = Array.from({ length: 3 }, () => ({
          red: 0,
          green: 0,
          blue: 0,
          count: 0,
        }));

        for (let y = 0; y < height; y += 2) {
          for (let x = 0; x < width; x += 2) {
            const offset = (y * width + x) * 4;

            const alpha = pixels[offset + 3] / 255;

            if (alpha < 0.1) continue;

            const zoneIndex = Math.min(2, Math.floor((x / width) * 3));

            const zone = zones[zoneIndex];

            zone.red += pixels[offset] * alpha;
            zone.green += pixels[offset + 1] * alpha;
            zone.blue += pixels[offset + 2] * alpha;
            zone.count += alpha;
          }
        }

        const colors = zones.map((zone) => {
          if (!zone.count) {
            return DEFAULT_AVATAR_PALETTE.middle;
          }

          return softenColor(
            zone.red / zone.count,
            zone.green / zone.count,
            zone.blue / zone.count,
          );
        });

        resolve({
          start: colors[0],
          middle: colors[1],
          end: colors[2],
        });
      } catch {
        // Canvas puede fallar si el servidor de imágenes no permite CORS.
        resolve(DEFAULT_AVATAR_PALETTE);
      }
    };

    image.onerror = () => {
      resolve(DEFAULT_AVATAR_PALETTE);
    };

    image.src = src;
  });
}
