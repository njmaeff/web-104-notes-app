export interface MovableElementOpts<
    Element extends MovableElement = MovableElement
> {
    onMouseUp: (e: MouseEvent, target: Element) => void;
    onDrag?: (e: MouseEvent | TouchEvent, target: Element) => void;
}

/**
 * Modified from https://stackoverflow.com/a/47596086/15809514
 */
export class MovableElement<Element extends HTMLElement = HTMLElement> {
    startDrag(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.makeAbsolutePosition();

        this.xOffset = e.clientX - rect.left;
        this.yOffset = e.clientY - rect.top;
        window.addEventListener("mousemove", this.onDrag);
    }

    dragObject(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        this.container.style.left = toPX(e.clientX - this.xOffset);
        this.container.style.top = toPX(e.clientY - this.yOffset);
    }

    public updatePosition(
        position: Partial<
            Pick<
                HTMLElement["style"],
                "position" | "width" | "height" | "top" | "left"
            >
        >
    ): void {
        Object.assign(this.container.style, position);
    }

    private makeAbsolutePosition(): DOMRect {
        const rect = this.container.getBoundingClientRect();
        Object.assign(this.container.style, {
            position: "absolute",
            width: toPX(rect.width),
            height: toPX(rect.height),
            top: toPX(rect.top),
            left: toPX(rect.left),
        });
        return rect;
    }

    constructor(public container: Element, opts?: MovableElementOpts) {
        const onDragStart = (e) => this.startDrag(e);
        container.addEventListener("mousedown", onDragStart);

        const onDrag = (e) => {
            this.dragObject(e);
            // we provide an optional callback so we can manipulate the dom
            // from the calling class if needed.
            opts?.onDrag?.(e, this);
        };

        // End dragging
        const mouseMove = (e) => {
            window.removeEventListener("mousemove", onDrag);

            // optional callback when mouse is released and dragging is over.
            opts?.onMouseUp?.(e, this);
        };
        document.addEventListener("mouseup", mouseMove);

        this.onDrag = onDrag;
        this.dispose = () => {
            container.removeEventListener("mousedown", onDragStart);
            document.removeEventListener("mouseup", mouseMove);
            container.remove();
        };
    }

    dispose: () => void;
    private readonly onDrag: (e: MouseEvent) => void;
    private xOffset = 0;
    private yOffset = 0;
}

export const toPX = (value: number | string) =>
    typeof value === "string" ? value + "px" : value.toString() + "px";
