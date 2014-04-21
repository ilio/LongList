LongList
========

javascript virtual long list
<br>
example http://jsfiddle.net/7HAzU/5

javascript: <br>
>ll = new Il.LongList({<br>
>    viewport: document.getElementById("vp"),<br>
>    rowTemplate: document.getElementById("t1"),<br>
>    data: window.data<br>
>});<br>
>ll.initialize();

html: <br>
> &lt;div id="t1" class="template row"&gt;<br>
>        &lt;div data-binding-html="name1"&gt;d&lt;/div&gt;<br>
>        &lt;div data-binding-text="value2"&gt;d&lt;/div&gt;<br>
>    &lt;/div&gt;<br>
> <br>
>&lt;div id="vp" class="viewport"&gt;<br>
>&lt;/div><br>

css: <br>
>.viewport {
>    height: 200px;
>}<br>
>.row{
>    border-bottom: 1px solid gray
>}<br>
