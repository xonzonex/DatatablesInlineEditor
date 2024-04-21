/*
MIT License

Copyright (c) 2024 Viktar Zheuzhyk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


"use strict";
class DatatablesInlineEditor {
    constructor(table, options) {
        this.table = table;
        this.options = options;
        this.prevCellValue = '';
        this.prevCellObj = null;
        this.currentCellObj = null;
        this.cellObj = {};
        this.cell = {};
        this.setField = {};
        this.cellSelector = options.cellSelector;
        this.eventHandlers = {};
        this.event = {}
        this.initListeners();
        this.handleCellClickEvent = this.handleCellClickEvent.bind(this);
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
        return this;
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }

    trigger(event, ...args) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(...args));
        }
    }

    initListeners() {
        const self = this;
        if (this.table !== undefined) {
            this.table.on("click", this.cellSelector, function (e) {
                self.handleCellClickEvent(e, this);
            });

            let keydownHandled = false;
            this.table.on("keydown focusout", this.cellSelector + " input", function (e) {
                if (e.type === "keydown") {
                    if (e.key !== "Enter") {
                        keydownHandled = false;
                        return;
                    }
                    keydownHandled = true;
                    self.handleCellEditEvent(e, this);
                } else if (e.type === "focusout" && !keydownHandled) {
                    self.handleCellEditEvent(e, this);
                } else {
                    keydownHandled = false;
                }
            });

            this.table.on("focusout", this.cellSelector + " select", function (e) {
                self.handleCellEditEvent(e, this);
            });
        }
    }

    handleCellClickEvent(e, cell) {
        this.event = e;
        this.trigger('cell.open', { e }, { cell: cell })
        let cellObj = this.table.cell(cell);
        this.cell = cellObj;
        if (this.currentCellObj) {
            this.prevCellObj = this.currentCellObj;
        }
        this.currentCellObj = cellObj.node();
        this.table = $(cell).closest('table').DataTable();
        let fieldName = this.table.settings()[0].aoColumns[cellObj.index().column].data;
        this.tryEnableContentEditable(cellObj, fieldName);

        this.trigger('cell.click', { e }, { table: this.table, cellObj: cellObj, input: this.cellObj });
    }

    tryEnableContentEditable(cell, fieldName) {
        if (!this.options.fields) return;
        const field = this.options.fields.find(field => field.name === fieldName);
        if (field) {

            if ($(cell.node()).find('input, select').length === 0) {
                let cellContent = this.setField && this.setField.name === fieldName
                    ? this.setField.value
                    : $(cell.node()).text().trim();

                this.prevCellValue = cellContent;
                $(cell.node()).empty();
                let inputElement;
                if (field.type === 'numeric') {
                    inputElement = $('<input>', {
                        type: 'text',
                        value: cellContent,
                        style: 'width: 100%',
                        class: (field.className) ? field.className : 'form-control',
                    });
                } else if (field.type === 'select') {
                    const cellsInColumn = $(cell.node()).closest('table').find('tbody tr td:nth-child(' + ($(cell.node()).index() + 1) + ')');

                    cellsInColumn.each(function () {
                        if (!$(this).is(cell)) {
                            const oldSelect = $(this).find('select');
                            if (oldSelect.length > 0) {
                                const previousText = oldSelect.find('option:selected').text();
                                oldSelect.remove();
                                $(this).text(previousText);
                            }
                        }
                    });

                    inputElement = $('<select>', {
                        class: (field.className) ? 'custom-editor-select ' + field.className : 'custom-editor-select',
                    });

                    field.options.forEach(option => {
                        let optionElement = $('<option>', {
                            value: option.value,
                            text: option.label
                        });
                        if (option.label === cellContent) {
                            optionElement.attr('selected', 'selected');
                        }
                        inputElement.append(optionElement);
                    });
                } else if (field.type === 'checkbox') {
                    inputElement = $('<input>', {
                        type: 'checkbox',
                        checked: cellContent === '1'
                    });
                } else if (field.type === 'date') {
                    inputElement = $('<input>', {
                        type: 'date',
                        value: cellContent,
                        style: 'width: 100%',
                        class: (field.className) ? field.className : 'form-control',
                    });
                } else {
                    inputElement = $('<input>', {
                        type: 'text',
                        value: cellContent,
                        style: 'width: 100%',
                        class: (field.className) ? field.className : 'form-control',
                    });
                }

                $(cell.node()).append(inputElement);

                if (field.type !== 'select' && field.type !== 'date') {
                    inputElement.focus();
                    inputElement[0].selectionStart = inputElement[0].selectionEnd = inputElement.val().length;

                    const selectCells = $(this.table.table().container()).find('tbody select');
                    selectCells.each(function () {
                        const oldSelect = $(this);
                        const previousText = oldSelect.find('option:selected').text();
                        oldSelect.closest('td').text(previousText);
                        oldSelect.remove();
                    });

                }

                if (field && field.type === 'numeric')
                    this.setNumericTypeToField(inputElement);
                this.cellObj = inputElement;
            }
        }
    }

    handleCellEditEvent(e, cell) {
        let cellObj = this.table.cell($(cell).closest('td')[0]);
        let fieldName = this.table.settings()[0].aoColumns[cellObj.index().column].data;
        let id = parseInt($(cellObj.node()).parent().attr('data-id'));
        let cellValue = $(cell).val();

        this.trigger('cell.preEdit', { e }, 'cell.preEdit');

        if (!this.options.fields) return;

        const field = this.options.fields.find(field => field.name === fieldName);
        if (field) {
            this.prepareCustomEditorData(fieldName, cellValue, [field]);
        }

        $(cell).prop('disabled', true);

        e.preventDefault();

        if (this.prevCellValue !== cellValue) {
            if (this.options.url && this.options.data) {
                $.ajax({
                    url: this.options.url,
                    type: this.options.method ? this.options.method : 'PUT',
                    data: {
                        action: 'edit',
                        ...this.options.data,
                        [`data[${id}][${fieldName}]`]: this.options.data.value
                    },
                    success: function (response) {
                        this.validateFields(id, fieldName, cellValue, cell, response);
                        this.trigger('cell.completeEdit', { e }, {})
                    }.bind(this),
                    error: function (error) {
                        console.error('AJAX error:', error);
                    }
                });
            }
        } else {
            let value = (this.#getRowDataById(id, cell, cellValue, fieldName)) ? this.#getRowDataById(id, cell, cellValue, fieldName) : this.options.data.value;
            $(cell).closest('td').empty().html(value);
        }
        this.trigger('cell.postEdit', { e }, { cellValue: cellValue });
    }

    prepareCustomEditorData(fieldName, fieldValue, fields) {
        const field = fields.find(field => field.name === fieldName);

        if (field) {
            if (field.type === 'numeric') {
                let value = fieldValue.replace(',', '.');
                if (!isNaN(value)) {
                    this.options.data.value = value;
                } else {
                    this.options.data.value = fieldValue;
                }
            } else if (field.type === 'checkbox') {
                this.options.data.value = fieldValue ? '1' : '0';
            } else {
                this.options.data.value = fieldValue;
            }
        } else {
            this.options.data.value = fieldValue;
        }
    }

    setNumericTypeToField(input = null) {
        if (!input) return;
        $(input).addClass('numeric-type').attr('autocomplete', 'off');
    };

    validateFields(id, fieldName, cellValue, cell, response) {
        if (response.fieldErrors) {

            $(cell).closest('td').find('.custom-editor-error').remove();

            let errorDiv = $('<div>', {
                'class': 'custom-editor-error',
                'style': 'display: none;'
            });

            response.fieldErrors.forEach(error => {
                error.status.forEach(status => {
                    let errorMessage = $('<div>', {
                        text: status,
                    });

                    errorDiv.append(errorMessage);
                });
            });
            $(cell).prop('disabled', false);
            $(cell).closest('td').append(errorDiv);
            errorDiv.slideDown();
        } else {
            let value = (this.#getRowDataById(id, cell, cellValue, fieldName)) ? this.#getRowDataById(id, cell, cellValue, fieldName) : this.options.data.value;
            $(cell).closest('td').empty().html(value);
        }
    }

    #getRowDataById(id, cell, cellValue, field) {
        let row = this.table.row(`[data-id="${id}"]`);
        if (row.any()) {
            let data = row.data();
            let returnData;
            this.trigger('row.changed', { event: this.event }, {
                cell: cell,
                tableCell: this.cell,
                cellValue: cellValue,
                rowData: data,
                field: field,
                prevCellObj: this.prevCellObj,
                callback: function (result) {
                    returnData = result
                }
            });

            cellValue = (returnData) ? returnData : cellValue;
        }
        return cellValue;
    }

    set(fieldName, value) {
        this.setField = { name: fieldName, value: value }
    }
}
