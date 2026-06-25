import { useEffect, useRef } from "react";

export function WaveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const getThemeColor = () => {
            const style = getComputedStyle(document.documentElement);
            const hsl = style.getPropertyValue('--primary').trim();
            let computedColor = hsl ? `hsl(${hsl})` : 'rgba(200, 210, 255, 0.5)';
            if (document.documentElement.classList.contains("dark")) computedColor = 'rgba(226, 226, 226, 0.5)';
            return computedColor;
        };

        let animationFrameId: number;
        let offset = 0;
        let lastTime = 0;

        const resize = () => {
            canvas.width = globalThis.innerWidth;
            canvas.height = globalThis.innerHeight;
        };

        globalThis.addEventListener("resize", resize);
        resize();

        const render = (currentTime: number) => {
            const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
            lastTime = currentTime;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const numWaves = 12;
            const speed = 0.15; 
            offset += speed * deltaTime;

            const baseColor = getThemeColor();

            for (let i = 0; i < numWaves; i++) {
                ctx.beginPath();

                ctx.globalAlpha = 0.15 + (i / numWaves) * 0.35;
                ctx.strokeStyle = baseColor;
                ctx.lineWidth = 1.2;

                for (let x = 0; x <= canvas.width; x += 10) {
                    const amplitude = 40 + i * 12;
                    const frequency = 0.0015 + (i * 0.0002);
                    const y = (canvas.height / 2) +
                        Math.sin(x * frequency + offset + (i * 0.6)) * amplitude;

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            globalThis.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none bg-background"
        />
    );
}