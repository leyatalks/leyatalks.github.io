// 该函数用于注册Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/leya-fronted/sw.js')
        .then(registration => {
          console.log('ServiceWorker 注册成功: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker 注册失败: ', error);
        });
    });
  }
}

// 检查并提示安装PWA
export function setupPWAInstallPrompt() {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止Chrome 67及更早版本自动显示安装提示
    e.preventDefault();
    // 保存事件以便稍后触发
    deferredPrompt = e;
    
    // 根据需要可以在这里添加UI提示用户安装应用
    // 例如可以显示一个按钮引导用户安装PWA
    console.log('可以安装PWA');
  });

  // 如果你想添加一个安装按钮，可以在按钮的点击事件处理程序中使用以下代码
  // installButton.addEventListener('click', (e) => {
  //   if (deferredPrompt) {
  //     // 显示安装提示
  //     deferredPrompt.prompt();
  //     // 等待用户响应
  //     deferredPrompt.userChoice.then((choiceResult) => {
  //       if (choiceResult.outcome === 'accepted') {
  //         console.log('用户接受安装PWA');
  //       } else {
  //         console.log('用户取消安装PWA');
  //       }
  //       deferredPrompt = null;
  //     });
  //   }
  // });
} 