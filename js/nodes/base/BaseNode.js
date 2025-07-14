// Base class for all Trendows nodes
class BaseNode extends LiteGraph.LGraphNode {
    constructor() {
        super();
        this.properties = this.properties || {};
        this.properties.name = this.properties.name || "";
    }
    
    // Standard menu options for all nodes
    getMenuOptions() {
        return [
            {
                content: "Properties",
                callback: () => {
                    if (graph) {
                        graph.selectNode(this);
                        showNodeProperties(this);
                    }
                }
            },
            null,
            {
                content: "Clone",
                callback: () => {
                    const cloned = LiteGraph.createNode(this.constructor.type || this.type);
                    if (cloned) {
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                }
            },
            {
                content: "Remove",
                callback: () => {
                    graph.remove(this);
                }
            }
        ];
    }
    
    // Helper method for drawing text on nodes
    drawText(ctx, text, x, y, options = {}) {
        const {
            font = "12px Arial",
            color = "#333",
            align = "center",
            baseline = "middle"
        } = options;
        
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }
    
    // Helper method for drawing colored indicators
    drawIndicator(ctx, x, y, radius, color, active = true) {
        ctx.globalAlpha = active ? 1.0 : 0.3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Make BaseNode available globally
window.BaseNode = BaseNode;