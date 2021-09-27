const catcher = document.createElement('div');
catcher.id = 'catcher';
document.body.append(catcher);
document.addEventListener('web:action', function (e) {
    if (e.detail && e.detail.type) {
        catcher.innerText = e.detail.type;
    }
});