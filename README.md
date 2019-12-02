# Wow Table 😲
## A Web Component to auto parse CSV files into HTML Tables

I coded this in a fever after being haunted by the idea on the way home from work one day, so excuse the mess!

Basic gist:
It's a web component! Do web component stuff!
It goes onto your HTML as `<wow-table></wow-table>`
You really only need to give it one attribute: `file`
This is the `src` attribute for the element, and it will download your csv file turn it into JSON and then create a table from that.

Todo
- [ ] also accept JSON object as an optional source
- [ ] expand on style settings and custom properties
- [ ] web worker for extremely large files?
- [ ] checking for different delimiters (currently only accepts `,`)
- [ ] flexbox???
