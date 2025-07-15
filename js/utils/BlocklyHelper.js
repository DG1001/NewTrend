const BlocklyHelper = {
    workspace: null,
    currentNode: null,
    closeHandler: null,
    saveHandler: null,
    escapeHandler: null,

    open(node) {
        this.currentNode = node;
        this.showEditor();
        this.injectBlockly();
    },

    showEditor() {
        // Clean up any existing modal first
        this.cleanupExistingModal();
        
        // Generate a unique ID for the Blockly container
        this.editorDivId = 'blockly-div-' + Date.now();
        const editorHTML = `
            <div id="blockly-editor" class="modal" style="display: flex;">
                <div class="modal-content resizable">
                    <div class="modal-header">
                        <h3>Blockly Editor</h3>
                        <span class="modal-close" id="blockly-close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div id="${this.editorDivId}" style="height: 100%; width: 100%;"></div>
                    </div>
                    <div class="modal-footer">
                        <button id="blockly-save" class="btn btn-primary">Save</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', editorHTML);

        // Store event handler references for proper cleanup
        this.closeHandler = () => this.close();
        this.saveHandler = () => this.save();
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        
        // Attach event listeners
        const closeButton = document.getElementById('blockly-close');
        const saveButton = document.getElementById('blockly-save');
        
        if (closeButton) {
            closeButton.addEventListener('click', this.closeHandler);
        }
        if (saveButton) {
            saveButton.addEventListener('click', this.saveHandler);
        }
        
        // Add escape key handler
        document.addEventListener('keydown', this.escapeHandler);
        
        // Add resize observer to update Blockly when modal is resized
        this.setupResizeObserver();
    },

    cleanupExistingModal() {
        // Remove existing modal if it exists
        const existingEditor = document.getElementById('blockly-editor');
        if (existingEditor) {
            existingEditor.remove();
        }
        
        // Clean up existing event listeners
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // Dispose of existing workspace
        if (this.workspace) {
            this.workspace.dispose();
            this.workspace = null;
        }
    },

    injectBlockly() {
        const blocklyDiv = document.getElementById(this.editorDivId);
        this.workspace = Blockly.inject(blocklyDiv, {
            toolbox: this.getToolbox()
        });

        if (this.currentNode.properties.blocklyXML) {
            this.workspace.clear();
            const xml = Blockly.Xml.textToDom(this.currentNode.properties.blocklyXML);
            Blockly.Xml.domToWorkspace(xml, this.workspace);
            Blockly.svgResize(this.workspace);
        }
    },

    getToolbox() {
        return `
            <xml>
                <category name="Logic" colour="%{BKY_LOGIC_HUE}">
                    <block type="controls_if"></block>
                    <block type="logic_compare"></block>
                    <block type="logic_operation"></block>
                    <block type="logic_negate"></block>
                    <block type="logic_boolean"></block>
                </category>
                <category name="Math" colour="%{BKY_MATH_HUE}">
                    <block type="math_number"></block>
                    <block type="math_arithmetic"></block>
                    <block type="math_single"></block>
                </category>
                <category name="Variables" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
                <category name="Node IO" colour="210">
                    <block type="get_input"></block>
                    <block type="set_output"></block>
                </category>
                <category name="Global Variables" colour="290">
                    <block type="set_global_variable"></block>
                    <block type="get_global_variable"></block>
                </category>
            </xml>
        `;
    },

    save() {
        const xml = Blockly.Xml.workspaceToDom(this.workspace);
        this.currentNode.properties.blocklyXML = Blockly.Xml.domToText(xml);
        this.currentNode.properties.generatedCode = Blockly.JavaScript.workspaceToCode(this.workspace);
        this.close();
    },

    close() {
        // Clean up event listeners first
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
        
        // Dispose of workspace
        if (this.workspace) {
            this.workspace.dispose();
            this.workspace = null;
        }
        
        // Remove modal from DOM
        const editor = document.getElementById('blockly-editor');
        if (editor) {
            editor.remove();
        }
        
        // Clear handler references
        this.closeHandler = null;
        this.saveHandler = null;
        this.currentNode = null;
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    },
    
    setupResizeObserver() {
        if (!window.ResizeObserver) {
            return; // Skip if ResizeObserver is not supported
        }
        
        this.resizeObserver = new ResizeObserver(() => {
            if (this.workspace) {
                // Small delay to ensure DOM has updated
                setTimeout(() => {
                    Blockly.svgResize(this.workspace);
                }, 10);
            }
        });
        
        const modalContent = document.querySelector('#blockly-editor .modal-content');
        if (modalContent) {
            this.resizeObserver.observe(modalContent);
        }
    }
};

window.BlocklyHelper = BlocklyHelper;

// Define custom blocks
Blockly.Blocks['get_input'] = {
  init: function() {
    this.appendValueInput("INPUT_INDEX")
        .setCheck("Number")
        .appendField("get input");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['get_input'] = function(block) {
  var value_input_index = Blockly.JavaScript.valueToCode(block, 'INPUT_INDEX', Blockly.JavaScript.ORDER_ATOMIC) || '1';
  var code = `inputs[${value_input_index} - 1]`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['set_output'] = {
  init: function() {
    this.appendValueInput("OUTPUT_INDEX")
        .setCheck("Number")
        .appendField("set output");
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['set_output'] = function(block) {
  var value_output_index = Blockly.JavaScript.valueToCode(block, 'OUTPUT_INDEX', Blockly.JavaScript.ORDER_ATOMIC) || '1';
  var value_value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `outputs[${value_output_index} - 1] = ${value_value};\n`;
  return code;
};

Blockly.Blocks['set_global_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("set global variable")
        .appendField(new Blockly.FieldTextInput("var_name"), "VAR_NAME");
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Sets the value of a global variable.");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['set_global_variable'] = function(block) {
  var var_name = block.getFieldValue('VAR_NAME');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `globals['${var_name}'] = ${value};\n`;
  return code;
};

Blockly.Blocks['get_global_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("get global variable")
        .appendField(new Blockly.FieldTextInput("var_name"), "VAR_NAME");
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip("Gets the value of a global variable.");
    this.setHelpUrl("");
  }
};

Blockly.JavaScript['get_global_variable'] = function(block) {
  var var_name = block.getFieldValue('VAR_NAME');
  var code = `globals['${var_name}']`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};
