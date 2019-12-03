# Wow Table 🍽😲
## A Web Component to auto-parse CSV files into HTML Tables

I coded this in a fever after being haunted by the idea on the way home from work one day, so excuse the mess!

Basic gist:
It's a web component! Do web component stuff!
It goes onto your HTML as `<wow-table></wow-table>`
You really only need to give it one attribute: `file`
This is the `src` attribute for the element, and it will download your csv file turn it into JSON and then create a table from that.

#### Todo
- [ ] also accept JSON object as an optional source (currently turns csv into 2D array so may need to rethink this aspiration)
- [ ] expand on style settings and custom properties
- [ ] web worker for extremely large files?
- [ ] checking for different delimiters (currently only accepts `,`)
- [ ] flexbox???

### Styles (Custom Properties)
Defaults follow the variable definition.
#### General
```css
--color: #040f0f;
--bg: #fff;
--bg-hover: #f0f1ff;
```
#### Container
```css
--c-display: inline-flex;
--c-align: center;
--c-justify: center;
/* 
   Comprised of multiple custom
   properties (defaults .25rem)
*/
--c-margin:
  --c-mt,
  --c-mr,
  --c-mb,
  --c-ml;
```
#### Table
```css
/* 
   Comprised of multiple custom
   properties (defaults to 4px solid #000)
*/
--t-border: 
  --t-border-width,
  --t-border-style,
  --t-border-color;
--t-border-radius: 4px;
--t-border-collapse: collapse;
```
#### Table Cells
```css
--tc-font-variant: tabular-nums;
--tc-talign: center;
/* 
   Comprised of multiple custom
   properties (defaults to 1px solid #000)
*/
--tc-border:
  --tc-border-width,
  --tc-border-style,
  --tc-border-color;
/* 
   Comprised of multiple custom
   properties (defaults to .25rem)
*/
--tc-padding: Comprised of multiple
  custom properties (defaults to .25rem)
  --tc-pt,
  --tc-pr,
  --tc-pb,
  --tc-pl;
```