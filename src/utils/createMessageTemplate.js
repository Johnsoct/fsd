const template = document.createElement('template')

template.innerHTML = `
    <li class="Message">
        <div class="Message__avatar"></div>
        <label class="Message__author"></label>
        <p class="Message__content"></p>
    </li>
`

export default template
