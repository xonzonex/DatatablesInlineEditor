## DatatablesInlineEditor

DatatablesInlineEditor is a JavaScript library that provides inline editing functionality for DataTables. It allows users to edit table cells directly within the DataTables interface, providing a seamless editing experience.

### Features

- **Inline Editing**: Edit table cells directly within the DataTables interface.
- **Customizable**: Easily customize the editor according to your application's needs.
- **Event Handling**: Support for event handling, allowing you to hook into various stages of the editing process.

### Usage

To use DatatablesInlineEditor in your project, follow these steps:

1. **Include Dependencies**: Make sure to include jQuery and DataTables library in your project.

   ```html
   <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
   <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.css">
   <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.js"></script>
   ```

2. **Include DatatablesInlineEditor**: Include the DatatablesInlineEditor script in your HTML file.

   ```html
   <script src="path/to/datatables-inline-editor.js"></script>
   ```

3. **Initialize DatatablesInlineEditor**: Initialize the DatatablesInlineEditor by providing the table element and options.

   ```javascript
   $(document).ready(function() {
       const table = $('#example').DataTable({
           ajax: {
               url: 'your-data-endpoint-url',
               dataSrc: 'data' // Adjust according to your API response structure
           },
           columns: [
               { data: 'name' },
               { data: 'age' },
               { data: 'date' },
               { data: 'active', render: function(data) { return data ? 'Yes' : 'No'; } }
           ]
       });

       const options = {
           cellSelector: 'tbody td',
           fields: [
               { name: 'name', type: 'text' },
               { name: 'age', type: 'numeric' },
               { name: 'date', type: 'date' },
               { name: 'active', type: 'checkbox' }
           ],
           url: 'your-update-endpoint-url',
           method: 'PUT',
           data: {youSendData: true},
           // Additional options as needed
       };

       const editor = new DatatablesInlineEditor(table, options);

       // Example event handlers
       editor.on('cell.open', function(event, data) {
           console.log('Cell opened:', data);
       });

       // Other event handlers...

   });
   ```

4. **Customize Event Handling**: Customize event handling as per your requirements. You can subscribe to various events such as 'cell.open', 'cell.click', 'cell.completeEdit', etc., using the `on` method, and trigger custom events using the `trigger` method. Use the `off` method to remove event handlers when necessary.

Make sure to replace `'your-data-endpoint-url'` and `'your-update-endpoint-url'` with the actual URLs of your server-side endpoints.

### Options

- **cellSelector**: Selector for table cells that should be editable.
- **fields**: An array of field configurations specifying the properties of editable fields (e.g., name, type, options).
- **url**: URL to which the edited data will be sent.
- **method**: HTTP method for sending data (default is 'PUT').
- **data**: Additional data to be sent along with the edited data.

### Events

DatatablesInlineEditor triggers several events during the editing process, allowing you to hook into various stages. You can use the `on`, `off`, and `trigger` methods to subscribe to and trigger these events.

- **cell.open**: Triggered when a cell is clicked to start editing.
- **cell.click**: Triggered when a cell is clicked.
- **cell.preEdit**: Triggered before a cell is edited.
- **cell.completeEdit**: Triggered after a cell is successfully edited.
- **cell.postEdit**: Triggered after a cell is edited, regardless of success.
- **row.changed**: Triggered when the data in a row is changed.

### License

This library is released under the MIT License. See the [LICENSE](LICENSE) file for details.

### Author

Written by Viktar Zheuzhyk.

### Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request on GitHub.

### Support

For support or inquiries, please contact [xonzonex@gmail.com](mailto:xonzonex@gmail.com).

### Donate (Coffee)
BTC bc1qnqu7zl2huqmam9703jc560jpkzxkny37jllz8m
