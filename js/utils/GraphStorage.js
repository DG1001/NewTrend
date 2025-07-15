// Graph storage utility for saving and loading node graphs
const GraphStorage = {
    // Storage key prefix
    STORAGE_PREFIX: 'trendows_graph_',
    METADATA_KEY: 'trendows_graph_metadata',
    
    // Get all saved graphs metadata
    getGraphList() {
        try {
            const metadata = localStorage.getItem(this.METADATA_KEY);
            return metadata ? JSON.parse(metadata) : {};
        } catch (error) {
            console.error('Error loading graph metadata:', error);
            return {};
        }
    },
    
    // Save a graph with metadata
    saveGraph(name, description = '') {
        if (!window.graph) {
            throw new Error('No graph available to save');
        }
        
        try {
            // Serialize the graph
            const graphData = graph.serialize();
            
            // Create metadata entry
            const timestamp = new Date().toISOString();
            const graphId = this.generateGraphId(name);
            
            // Save graph data
            localStorage.setItem(this.STORAGE_PREFIX + graphId, JSON.stringify(graphData));
            
            // Update metadata
            const metadata = this.getGraphList();
            metadata[graphId] = {
                name: name,
                description: description,
                timestamp: timestamp,
                nodeCount: graphData.nodes ? graphData.nodes.length : 0,
                linkCount: graphData.links ? graphData.links.length : 0
            };
            
            localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
            
            return {
                success: true,
                graphId: graphId,
                message: `Graph "${name}" saved successfully`
            };
            
        } catch (error) {
            console.error('Error saving graph:', error);
            return {
                success: false,
                message: `Failed to save graph: ${error.message}`
            };
        }
    },
    
    // Load a graph by ID
    loadGraph(graphId) {
        if (!window.graph) {
            throw new Error('No graph instance available');
        }
        
        try {
            const graphDataStr = localStorage.getItem(this.STORAGE_PREFIX + graphId);
            if (!graphDataStr) {
                throw new Error('Graph not found');
            }
            
            const graphData = JSON.parse(graphDataStr);
            
            // Clear current graph
            graph.clear();
            
            // Load the saved graph
            graph.configure(graphData);
            
            // Refresh canvas
            if (window.canvas) {
                canvas.setDirty(true, true);
            }
            
            // Get metadata for success message
            const metadata = this.getGraphList();
            const graphInfo = metadata[graphId];
            
            return {
                success: true,
                message: `Graph "${graphInfo ? graphInfo.name : graphId}" loaded successfully`,
                nodeCount: graphData.nodes ? graphData.nodes.length : 0,
                linkCount: graphData.links ? graphData.links.length : 0
            };
            
        } catch (error) {
            console.error('Error loading graph:', error);
            return {
                success: false,
                message: `Failed to load graph: ${error.message}`
            };
        }
    },
    
    // Delete a saved graph
    deleteGraph(graphId) {
        try {
            // Remove graph data
            localStorage.removeItem(this.STORAGE_PREFIX + graphId);
            
            // Update metadata
            const metadata = this.getGraphList();
            delete metadata[graphId];
            localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
            
            return {
                success: true,
                message: 'Graph deleted successfully'
            };
            
        } catch (error) {
            console.error('Error deleting graph:', error);
            return {
                success: false,
                message: `Failed to delete graph: ${error.message}`
            };
        }
    },
    
    // Generate a unique ID for a graph
    generateGraphId(name) {
        const timestamp = Date.now();
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return `${safeName}_${timestamp}`;
    },
    
    // Export graph as JSON file
    exportGraph(name) {
        if (!window.graph) {
            throw new Error('No graph available to export');
        }
        
        try {
            const graphData = graph.serialize();
            const exportData = {
                name: name,
                timestamp: new Date().toISOString(),
                version: '1.0',
                graph: graphData
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return {
                success: true,
                message: `Graph exported as ${link.download}`
            };
            
        } catch (error) {
            console.error('Error exporting graph:', error);
            return {
                success: false,
                message: `Failed to export graph: ${error.message}`
            };
        }
    },
    
    // Import graph from JSON data
    importGraph(jsonData) {
        if (!window.graph) {
            throw new Error('No graph instance available');
        }
        
        try {
            let graphData;
            
            // Handle different import formats
            if (jsonData.graph) {
                // Our export format
                graphData = jsonData.graph;
            } else if (jsonData.nodes || jsonData.links) {
                // Direct LiteGraph format
                graphData = jsonData;
            } else {
                throw new Error('Invalid graph format');
            }
            
            // Clear current graph
            graph.clear();
            
            // Load the imported graph
            graph.configure(graphData);
            
            // Refresh canvas
            if (window.canvas) {
                canvas.setDirty(true, true);
            }
            
            return {
                success: true,
                message: 'Graph imported successfully',
                nodeCount: graphData.nodes ? graphData.nodes.length : 0,
                linkCount: graphData.links ? graphData.links.length : 0
            };
            
        } catch (error) {
            console.error('Error importing graph:', error);
            return {
                success: false,
                message: `Failed to import graph: ${error.message}`
            };
        }
    },
    
    // Auto-save current graph
    autoSave() {
        const autoSaveName = 'AutoSave';
        const result = this.saveGraph(autoSaveName, 'Automatically saved graph');
        return result;
    },
    
    // Clear all saved graphs
    clearAllGraphs() {
        try {
            const metadata = this.getGraphList();
            
            // Remove all graph data
            Object.keys(metadata).forEach(graphId => {
                localStorage.removeItem(this.STORAGE_PREFIX + graphId);
            });
            
            // Clear metadata
            localStorage.removeItem(this.METADATA_KEY);
            
            return {
                success: true,
                message: 'All saved graphs cleared'
            };
            
        } catch (error) {
            console.error('Error clearing graphs:', error);
            return {
                success: false,
                message: `Failed to clear graphs: ${error.message}`
            };
        }
    },
    
    // Get storage usage information
    getStorageInfo() {
        try {
            const metadata = this.getGraphList();
            let totalSize = 0;
            
            Object.keys(metadata).forEach(graphId => {
                const data = localStorage.getItem(this.STORAGE_PREFIX + graphId);
                if (data) {
                    totalSize += data.length;
                }
            });
            
            return {
                graphCount: Object.keys(metadata).length,
                totalSize: totalSize,
                formattedSize: this.formatBytes(totalSize)
            };
            
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { graphCount: 0, totalSize: 0, formattedSize: '0 B' };
        }
    },
    
    // Format bytes to human readable string
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Make GraphStorage available globally
window.GraphStorage = GraphStorage;