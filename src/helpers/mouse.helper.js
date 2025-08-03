// This injects a box into the page that moves with the mouse;
// Useful for debugging

const { getRandomPagePoint,
  createCursor
} = require('ghost-cursor');
const mouseNormal =
  'https://raw.githubusercontent.com/NVT-Freelancer/LICENSES/main/yt-automation/images/mouse-normal.svg';
const mouseDown =
  'https://raw.githubusercontent.com/NVT-Freelancer/LICENSES/main/yt-automation/images/mouse-down.svg';

//console.log(mouseNormal, mouseDown);

const defaultOption = {
  top: '0',
  left: '0',
  opacity: 0.8,
  className: 'mouse-helper-container',
};
async function installMouseHelper(page) {

  if(!page?._cursor){
    const cursor = createCursor(page);
    page._cursor= cursor;
  }

  await page.evaluateOnNewDocument(() => {
    // Install mouse helper only for top-level frame.
    if (window !== window.parent) return;

    window.addEventListener(
      'DOMContentLoaded',
      () => {
        const box = document.createElement('puppeteer-mouse-pointer');
        const styleElement = document.createElement('style');

        styleElement.innerHTML = `
        puppeteer-mouse-pointer {
          pointer-events: none;
          position: fixed;
          top : 60%;
          left : 52%;
          z-index: 10000;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          padding: 0;
          transition: background .2s, border-radius .2s, border-color .2s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='white' stroke='black' stroke-width='20' d='M423.547,323.115l-320-320c-3.051-3.051-7.637-3.947-11.627-2.304s-6.592,5.547-6.592,9.856V480c0,4.501,2.837,8.533,7.083,10.048c4.224,1.536,8.981,0.192,11.84-3.285l85.205-104.128l56.853,123.179c1.792,3.883,5.653,6.187,9.685,6.187c1.408,0,2.837-0.277,4.203-0.875l74.667-32c2.645-1.131,4.736-3.285,5.76-5.973c1.024-2.688,0.939-5.675-0.277-8.299l-57.024-123.52h132.672c4.309,0,8.213-2.603,9.856-6.592C427.515,330.752,426.598,326.187,423.547,323.115z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: contain;
        }
        puppeteer-mouse-pointer.button-1 {
          transition: none;
          background-color: rgba(0,0,0,0.9);
        }
        puppeteer-mouse-pointer.button-2 {
          transition: none;
          border-color: rgba(0,0,255,0.9);
        }
        puppeteer-mouse-pointer.button-3 {
          transition: none;
          border-radius: 4px;
        }
        puppeteer-mouse-pointer.button-4 {
          transition: none;
          border-color: rgba(255,0,0,0.9);
        }
        puppeteer-mouse-pointer.button-5 {
          transition: none;
          border-color: rgba(0,255,0,0.9);
        }
      `;
        document.head.appendChild(styleElement);
        document.body.appendChild(box);

        document.addEventListener(
          'mousemove',
          (event) => {
            box.style.left = event.pageX + 'px';
            box.style.top = event.pageY + 'px';
            updateButtons(event.buttons);
          },
          true
        );

        document.addEventListener(
          'mousedown',
          (event) => {
            updateButtons(event.buttons);
            box.classList.add('button-' + event.which);
          },
          true
        );

        document.addEventListener(
          'mouseup',
          (event) => {
            updateButtons(event.buttons);
            box.classList.remove('button-' + event.which);
          },
          true
        );

        function updateButtons(buttons) {
          for (let i = 0; i < 5; i++)
            box.classList.toggle('button-' + i, buttons & (1 << i));
        }
      },
      false
    );
  });

  const p =await getRandomPagePoint(page);
  page?._cursor.moveTo(p);
}

async function installMouseVisual(page) {
  await page.evaluateOnNewDocument(() => {
    // Install mouse helper only for top-level frame.
    if (window !== window.parent) return;
    window.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!document.body) {
          console.log('Failed to create mouse helper, document.body not ready');
          return false;
        }
        const o = Object.assign(defaultOption, option);
        let container = document.querySelector(`.${o.className}`);
        if (container) {
          return true;
        }
        container = document.createElement('div');
        container.className = o.className;
        container.style.cssText = `top: ${o.top}; left: ${o.left}; opacity: ${o.opacity}; position: absolute; z-index: 99999; user-select: none; pointer-events: none;`;

        const imageDown = document.createElement('img');
        imageDown.src = mouseDown;
        imageDown.style.cssText =
          'position: absolute; top: -10px; left: -10px; width: 20px; height: 20px; display: none;';
        container.appendChild(imageDown);

        const imageNormal = document.createElement('img');
        imageNormal.src = mouseNormal;
        imageNormal.style.cssText =
          'position: absolute; top: 0; left: -3px; width: 20px; height: 20px; display: none;';
        container.appendChild(imageNormal);

        document.body.appendChild(container);

        let firstMoved;
        let requestId;
        document.addEventListener('mousemove', function (e) {
          if (!firstMoved) {
            firstMoved = true;
            imageNormal.style.display = 'block';
          }

          //throttle
          //console.log(requestId);
          window.cancelAnimationFrame(requestId);
          requestId = window.requestAnimationFrame(() => {
            //console.log(requestId, '-');
            container.style.left = `${e.pageX}px`;
            container.style.top = `${e.pageY}px`;
          });
        });

        document.addEventListener('mousedown', function () {
          imageDown.style.display = 'block';
        });
        document.addEventListener('mouseup', function () {
          imageDown.style.display = 'none';
        });
      },
      false
    );
  });
}

module.exports = { installMouseHelper, installMouseVisual };
