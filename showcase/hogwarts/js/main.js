
    (function () {
      'use strict';

      /* Sparkle cursor */
      var sCV = document.getElementById('cv'), sCtx = sCV.getContext('2d');
      function sR() { sCV.width = innerWidth; sCV.height = innerHeight; } sR(); window.addEventListener('resize', sR);
      var sP = [], sC = ['rgba(240,204,122,', 'rgba(200,165,105,', 'rgba(255,240,170,', 'rgba(180,132,62,'];
      document.addEventListener('mousemove', function (e) {
        if (Math.random() < .4) sP.push({
          x: e.clientX + (Math.random() - .5) * 10,
          y: e.clientY + (Math.random() - .5) * 10,
          vx: (Math.random() - .5) * 1.8,
          vy: -Math.random() * 2.2 - .7,
          r: Math.random() * 2.8 + 1,
          a: .88,
          c: sC[0 | Math.random() * 4]
        });
      });
      (function sL() {
        sCtx.clearRect(0, 0, sCV.width, sCV.height);
        sP = sP.filter(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += .04; p.a -= .02;
          if (p.a <= 0) return false;
          sCtx.beginPath(); sCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          sCtx.fillStyle = p.c + p.a + ')'; sCtx.fill(); return true;
        });
        requestAnimationFrame(sL);
      })();

      /* Embers on Platform */
      (function () {
        var sc = document.getElementById('s-intro');
        for (var i = 0; i < 18; i++) {
          var em = document.createElement('div');
          em.className = 'ember';
          var sz = Math.random() * 3 + 1.5;
          em.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + Math.random() * 100 + '%;bottom:' + Math.random() * 14 + '%;animation-duration:' + (6 + Math.random() * 10) + 's;animation-delay:' + Math.random() * 8 + 's;--ex:' + ((Math.random() - .5) * 120) + 'px;';
          sc.appendChild(em);
        }
      })();

      /* Platform entrance text animations */
      setTimeout(function () {
        document.getElementById('hb-line').classList.add('show');
        setTimeout(function () { document.getElementById('hb-name').classList.add('show'); }, 900);
        setTimeout(function () { document.getElementById('hb-sub').classList.add('show'); }, 2200);
        setTimeout(function () { document.getElementById('begin-btn').classList.add('show'); }, 3600);
      }, 500);

      /* Begin -> Cinematic Typing */
      document.getElementById('begin-btn').addEventListener('click', function () {
        document.getElementById('bg-audio').play().catch(function () { });
        var fl = document.getElementById('flash'); fl.style.transition = 'opacity .5s'; fl.style.opacity = '1';
        setTimeout(function () { fl.style.transition = 'opacity 1.1s'; fl.style.opacity = '0'; }, 700);
        setTimeout(function () {
          document.getElementById('s-intro').classList.remove('active');
          var st = document.getElementById('s-typing'); st.style.display = 'flex';
          setTimeout(function () { st.classList.add('active'); startTyping(); }, 100);
        }, 1400);
      });

      /* Cinematic typing sequence */
      function startTyping() {
        var lines = [
          'Messrs. Moony, Wormtail, Padfoot and Prongs',
          'are proud to present',
          "The Marauder's Map",
          '— for The Seeker —',
          'on the occasion of a magical journey'
        ];
        var el = document.getElementById('typing-line');
        var li = 0, ci = 0, wait = false;
        function run() {
          if (li >= lines.length) {
            setTimeout(function () {
              var fl = document.getElementById('flash'); fl.style.transition = 'opacity .6s'; fl.style.opacity = '1';
              setTimeout(function () {
                document.getElementById('s-typing').classList.remove('active');
                document.getElementById('s-typing').style.display = 'none';
                fl.style.transition = 'opacity 1.2s'; fl.style.opacity = '0';
                var sm = document.getElementById('s-map'); sm.style.display = 'flex';
                setTimeout(function () {
                  sm.classList.add('active');
                  setTimeout(function () { document.getElementById('oath-field').focus(); }, 600);
                }, 100);
              }, 600);
            }, 1200); return;
          }
          if (wait) { wait = false; li++; ci = 0; setTimeout(function () { el.innerHTML = ''; run(); }, 300); return; }
          var line = lines[li];
          if (ci <= line.length) {
            el.innerHTML = line.slice(0, ci); ci++;
            setTimeout(run, (li === 3 ? 54 : 29) + Math.random() * 15);
          } else {
            wait = true;
            setTimeout(run, li === 3 ? 1400 : 900);
          }
        }
        setTimeout(run, 400);
      }

      /* Oath activation */
      var oathField = document.getElementById('oath-field');
      oathField.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var v = oathField.value.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
        if (v === 'i solemnly swear that i am up to no good' || v.includes('solemnly swear')) {
          document.getElementById('oath-input-wrap').classList.add('gone');
          setTimeout(function () {
            document.getElementById('oath-input-wrap').style.display = 'none';
            updateMapUnlocks(true);
          }, 900);
        } else {
          oathField.style.borderBottomColor = 'rgba(200,100,100,.48)'; oathField.value = ''; oathField.placeholder = 'Try again... speak the oath true';
          setTimeout(function () {
            oathField.style.borderBottomColor = 'rgba(200,165,105,.26)';
            oathField.placeholder = 'I solemnly swear that I am up to no good';
          }, 1800);
        }
      });

      /* Wizards roaming map */
      function initWizards() {
        spawnWizard('Harry', 18, 25, 0.018, 0.012);
        spawnWizard('Hermione', 72, 42, -0.016, 0.015);
        spawnWizard('Luna', 28, 75, 0.019, -0.014);
        spawnWizard('Ron', 60, 65, -0.014, 0.012);
        spawnWizard('Srishti', 45, 80, 0.015, -0.016);
      }
      function spawnWizard(name, x, y, vx, vy) {
        var frame = document.getElementById('map-frame'); if (!frame) return;
        var px = x, py = y, count = 0;
        var tag = document.createElement('div'); tag.className = 'label-tag'; tag.textContent = name; frame.appendChild(tag);
        setInterval(function () {
          var angleRad = Math.atan2(vy, vx);
          var spd = Math.sqrt(vx * vx + vy * vy);
          if (spd === 0) { vx = 0.02; vy = 0.02; spd = 0.028; }

          angleRad += (Math.random() - 0.5) * 0.4;
          vx = Math.cos(angleRad) * spd;
          vy = Math.sin(angleRad) * spd;

          var maxSpd = 0.035; if (spd > maxSpd) { vx = vx / spd * maxSpd; vy = vy / spd * maxSpd; }
          var minSpd = 0.012; if (spd < minSpd) { vx = vx / spd * minSpd; vy = vy / spd * minSpd; }

          px += vx * 3.0; py += vy * 3.0;

          if (px > 95) { vx = -Math.abs(vx); px = 95; }
          if (px < 5) { vx = Math.abs(vx); px = 5; }
          if (py > 95) { vy = -Math.abs(vy); py = 95; }
          if (py < 5) { vy = Math.abs(vy); py = 5; }

          var foot = document.createElement('div'); foot.className = 'footstep';
          var drawAngleRad = Math.atan2(vy, vx);
          var angleDeg = drawAngleRad * (180 / Math.PI) + 90;

          var sideOffset = (count % 2 === 0 ? 0.4 : -0.4);
          var ox = Math.cos(drawAngleRad + Math.PI / 2) * sideOffset;
          var oy = Math.sin(drawAngleRad + Math.PI / 2) * sideOffset;

          foot.style.left = (px + ox) + '%';
          foot.style.top = (py + oy) + '%';
          foot.style.transform = 'rotate(' + angleDeg + 'deg)';

          tag.style.left = px + '%'; tag.style.top = py + '%';
          frame.appendChild(foot); count++;
          setTimeout(function () { if (foot.parentNode) foot.parentNode.removeChild(foot); }, 4000);
        }, 450);
      }

      /* Map progression system */
      var visitedMapNodes = new Set();
      var nodeOrder = ['p-owlery', 'p-memory', 'p-room'];
      var mapStories = [
        "Owls bearing whispers from those who know you best...",
        "Silver memories swirling in the Pensieve's depths...",
        "The final space forms only when the seeker is fully prepared..."
      ];
      var currentStoryIndex = -1;

      function updateMapUnlocks(isInitial, cb) {
        var count = visitedMapNodes.size;

        if (visitedMapNodes.has('p-room')) {
          document.getElementById('s-map').classList.add('story-complete');
        }

        var nextIndex = Math.min(count, mapStories.length - 1);
        if (nextIndex > currentStoryIndex || isInitial) {
          currentStoryIndex = nextIndex;
          playStorySequence(mapStories[currentStoryIndex], function () {
            if (isInitial) {
              initWizards();
            }

            document.querySelectorAll('.node').forEach(function (n) {
              var pId = n.getAttribute('data-p');
              var oIndex = nodeOrder.indexOf(pId);

              n.classList.remove('state-visited', 'state-next', 'state-hidden');

              if (pId === 'p-room') {
                if (count >= 2) {
                  n.classList.add(visitedMapNodes.has('p-room') ? 'state-visited' : 'state-next');
                } else {
                  n.classList.add('state-hidden');
                }
                return;
              }

              if (oIndex < count) {
                n.classList.add('state-visited');
              } else if (oIndex === count) {
                n.classList.add('state-next');
              } else {
                n.classList.add('state-hidden');
              }
            });
            if (cb) cb();
          });
        } else {
          document.querySelectorAll('.node').forEach(function (n) {
            var pId = n.getAttribute('data-p');
            var oIndex = nodeOrder.indexOf(pId);

            n.classList.remove('state-visited', 'state-next', 'state-hidden');

            if (pId === 'p-room') {
              if (count >= 2) {
                n.classList.add(visitedMapNodes.has('p-room') ? 'state-visited' : 'state-next');
              } else {
                n.classList.add('state-hidden');
              }
              return;
            }

            if (oIndex < count) {
              n.classList.add('state-visited');
            } else if (oIndex === count) {
              n.classList.add('state-next');
            } else {
              n.classList.add('state-hidden');
            }
          });
          if (cb) cb();
        }
      }

      function playStorySequence(text, cb) {
        var mo = document.getElementById('map-open');
        var st = document.getElementById('s-typing');
        var el = document.getElementById('typing-line');
        el.innerHTML = '';

        st.classList.add('overlay-mode');

        var isInitial = !mo.classList.contains('show');
        if (isInitial) {
          mo.classList.add('show');
          setTimeout(showStoryOverlay, 100);
        } else {
          showStoryOverlay();
        }

        function showStoryOverlay() {
          st.style.display = 'flex';
          void st.offsetWidth;
          st.classList.add('active');

          setTimeout(function () {
            var ci = 0;
            function run() {
              if (ci <= text.length) {
                el.innerHTML = text.slice(0, ci);
                ci++;
                setTimeout(run, 35 + Math.random() * 20);
              } else {
                setTimeout(function () {
                  st.classList.remove('active');
                  setTimeout(function () {
                    st.style.display = 'none';
                    if (cb) cb();
                  }, 1500);
                }, 2800);
              }
            }
            run();
          }, 400);
        }
      }

      /* Node clicks */
      document.querySelectorAll('.node').forEach(function (n) {
        n.addEventListener('click', function () {
          var pId = n.getAttribute('data-p');
          if (!pId) return;
          visitedMapNodes.add(pId);
          n.classList.remove('state-next');
          n.classList.add('state-visited');
          openPanel(pId);
        });
      });

      function openPanel(id) {
        var el = document.getElementById(id); if (!el) return;
        el.classList.add('active'); el.scrollTop = 0;
        if (id === 'p-owlery') initOwlery();
        if (id === 'p-memory') initMemory();
        if (id === 'p-room') initRoom();
      }

      window.closePanel = function (id) {
        var el = document.getElementById(id); if (el) el.classList.remove('active');
        if (id === 'p-room') return;
        updateMapUnlocks(false);
      };

      window.playFinale = function () {
        var el = document.getElementById('p-room');
        if (el) el.classList.remove('active');

        var mapOpen = document.getElementById('map-open');
        mapOpen.style.transition = 'opacity 3s ease';
        mapOpen.style.opacity = '0.05';

        setTimeout(function () {
          document.getElementById('s-finale').classList.add('active');
          document.getElementById('s-map').classList.remove('active');
          setTimeout(function () {
            var title = document.getElementById('fin-title');
            title.style.opacity = '1';
            title.style.transform = 'scale(1)';
            setTimeout(function () {
              var msg = document.getElementById('fin-msg');
              msg.style.opacity = '1';
            }, 2500);
          }, 500);
        }, 2000);
      };

      /* OWLERY */
      var owlsUp = false;
      function initOwlery() {
        if (owlsUp) return; owlsUp = true;
        var all; try { all = JSON.parse(document.getElementById('LETTERS').textContent); } catch (e) { return; }
        var grid = document.getElementById('env-grid');
        grid.className = 'post-office-desk';
        grid.innerHTML = '<div id="unread-pile" class="bundle-pile" data-label="Unread Post"></div><div id="read-pile" class="bundle-pile" data-label="Read Mail"></div>';
        var unreadPile = document.getElementById('unread-pile');
        var readPile = document.getElementById('read-pile');

        var stamps = [['⚡', '🦉', '⚗'], ['★', '🌙'], ['✦', '📜'], ['🦅', '⚡']];
        var seals = ['H', '★', '✦', 'R']; var sealGold = [false, true, false, false];

        var shuffledIndices = all.map(function (_, i) { return i; }).sort(function () { return 0.5 - Math.random(); });

        shuffledIndices.forEach(function (index, sortPosition) {
          var d = all[index];
          var env = document.createElement('div');
          env.className = 'env';
          if (Math.random() > 0.5) env.classList.add('tint-1');
          else if (Math.random() > 0.5) env.classList.add('tint-2');

          var rot = (Math.random() - 0.5) * 14;
          var xOff = (Math.random() - 0.5) * 16;
          var yOff = (Math.random() - 0.5) * 12;
          env.style.transform = 'translate(' + xOff + 'px, ' + yOff + 'px) rotate(' + rot + 'deg)';
          env.style.zIndex = sortPosition + 1;

          var st = stamps[index % stamps.length];
          var sl = seals[index % seals.length];
          var sg = sealGold[index % sealGold.length];

          var stampHtml = st.map(function (s, si) {
            return '<div class="env-stamp" style="top:' + (8 + si * 2) + 'px;right:' + (8 + si * 25) + 'px;">' + s + '</div>';
          }).join('');

          env.innerHTML =
            '<div class="env-back">' +
            '<div class="env-wax' + (sg ? ' gold' : '') + '">' + sl + '</div>' +
            '</div>' +
            '<div class="env-front">' +
            stampHtml +
            '<div class="env-addr">' +
            '<div class="addr-name">' + esc(d.from) + '</div>' +
            '<div class="addr-line">' + esc(d.head || 'Hogwarts Post') + '</div>' +
            '<div class="addr-line">By Special Owl Delivery</div>' +
            '</div>' +
            '</div>';

          env.addEventListener('click', function () {
            openLetter(d, env, readPile);
          });

          unreadPile.appendChild(env);
        });
      }

      var currentLtrTick = 0;
      function openLetter(d, envEl, readPile) {
        currentLtrTick++;
        var myTick = currentLtrTick;

        var ov = document.getElementById('ltr-ov');
        var paper = document.getElementById('ltr-paper');
        var meta = document.getElementById('ltr-meta');
        var head = document.getElementById('ltr-head');
        var body = document.getElementById('ltr-body');

        if (envEl && !envEl.classList.contains('read-state')) {
          envEl.classList.add('read-state');
          setTimeout(function () {
            readPile.appendChild(envEl);
            var rot = (Math.random() - 0.5) * 16;
            var xOff = (Math.random() - 0.5) * 14;
            var yOff = (Math.random() - 0.5) * 10;
            envEl.style.transform = 'translate(' + xOff + 'px, ' + yOff + 'px) rotate(' + rot + 'deg)';
            envEl.style.zIndex = readPile.children.length;
          }, 600);
        }

        ov.classList.add('active');
        paper.classList.remove('unfolded');
        meta.innerHTML = ''; head.innerHTML = ''; body.innerHTML = '';

        setTimeout(function () {
          paper.classList.add('unfolded');
          setTimeout(function () {
            meta.innerHTML = '<span class="ltr-from">' + esc(d.from) + '</span><span class="ltr-date">' + esc(d.date || '') + '</span>';
            head.innerHTML = esc(d.head || '');

            var rawBody = d.body || '';
            var lines = rawBody.split('\n');
            var pi = 0;
            function nl() {
              if (myTick !== currentLtrTick) return;
              if (pi >= lines.length) {
                if (d.sig) {
                  var sEl = document.createElement('div');
                  sEl.className = 'ltr-sig';
                  sEl.innerHTML = esc(d.sig).replace(/\n/g, '<br>');
                  body.appendChild(sEl);
                }
                return;
              }
              var ln = lines[pi++];
              if (!ln.trim()) {
                body.appendChild(document.createElement('br'));
                setTimeout(nl, 150);
                return;
              }
              var p = document.createElement('p');
              body.appendChild(p);
              tw(p, ln, nl, myTick);
            }
            nl();
          }, 800);
        }, 400);

        ov.onclick = function (e) {
          if (e.target === ov || e.target.id === 'ltr-wrap') {
            currentLtrTick++;
            ov.classList.remove('active');
            paper.classList.remove('unfolded');
          }
        };
      }

      /* MEMORY STAIRCASE */
      var memUp = false, memPaused = false;
      var rawPhotos = [
        "crest_gryffindor.svg", "crest_slytherin.svg", "crest_ravenclaw.svg", "crest_hufflepuff.svg",
        "elder_wand.svg", "snitch.svg", "sorting_hat.svg", "patronus.svg",
        "dp_train.png", "dp_ministry.png",
        "crest_gryffindor.svg", "crest_ravenclaw.svg", "snitch.svg", "patronus.svg",
        "crest_slytherin.svg", "crest_hufflepuff.svg", "elder_wand.svg", "sorting_hat.svg"
      ];
      var aspectRatios = ['sq', 'pt', 'ld', 'sq', 'ld', 'pt', 'xl', 'tl'];
      var PHOTOS = [];

      function initMemory() {
        if (memUp) return; memUp = true;
        var cols = [document.getElementById('col1'), document.getElementById('col2'), document.getElementById('col3'), document.getElementById('col4')];
        var ci = [[], [], [], []];

        var shuffled = rawPhotos.slice().sort(function () { return 0.5 - Math.random(); });
        PHOTOS = shuffled.map(function (f, i) {
          return { src: 'images/' + f, ar: aspectRatios[i % aspectRatios.length], vid: f.indexOf('.mp4') > -1 };
        });

        var cHeights = [0, 0, 0, 0];
        PHOTOS.forEach(function (item) {
          var h = 1;
          if (item.ar === 'pt') h = 1.33; else if (item.ar === 'ld') h = 0.75;
          else if (item.ar === 'xl') h = 0.56; else if (item.ar === 'tl') h = 1.5;
          var mc = 0, mv = cHeights[0];
          for (var j = 1; j < 4; j++) { if (cHeights[j] < mv) { mv = cHeights[j]; mc = j; } }
          ci[mc].push(item); cHeights[mc] += h + 0.1;
        });

        cols.forEach(function (col, idx) {
          col.innerHTML = '';
          var items = ci[idx];
          var loopItems = items.concat(items);
          loopItems.forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'pcard ' + item.ar;
            var img = document.createElement('img');
            img.src = item.src;
            img.alt = 'Memory Artifact';
            img.loading = 'lazy';
            card.appendChild(img);

            card.addEventListener('click', function () {
              openLb(item.src, false);
            });
            col.appendChild(card);
          });
        });

        var scrollPos = 0;
        var wall = document.getElementById('memory-wall');
        function autoScroll() {
          if (!memPaused && document.getElementById('p-memory').classList.contains('active')) {
            scrollPos += 0.75;
            if (scrollPos > 1200) scrollPos = 0;
            cols[0].style.transform = 'translateY(' + (-scrollPos) + 'px)';
            cols[1].style.transform = 'translateY(' + (-scrollPos * 1.15) + 'px)';
            cols[2].style.transform = 'translateY(' + (-scrollPos * 0.9) + 'px)';
            cols[3].style.transform = 'translateY(' + (-scrollPos * 1.05) + 'px)';
          }
          requestAnimationFrame(autoScroll);
        }
        requestAnimationFrame(autoScroll);

        wall.addEventListener('click', function () {
          memPaused = !memPaused;
          var hint = document.getElementById('pause-hint');
          if (hint) {
            hint.style.opacity = memPaused ? '1' : '0';
          }
        });
      }

      function openLb(src, isVid) {
        var lb = document.getElementById('lb');
        var img = document.getElementById('lb-img');
        var vid = document.getElementById('lb-vid');
        if (isVid) {
          img.style.display = 'none'; vid.style.display = 'block'; vid.src = src; vid.play();
        } else {
          vid.style.display = 'none'; img.style.display = 'block'; img.src = src;
        }
        lb.classList.add('active');
      }

      document.getElementById('lb-x').addEventListener('click', function () {
        document.getElementById('lb').classList.remove('active');
        var vid = document.getElementById('lb-vid'); vid.pause(); vid.src = '';
      });
      document.getElementById('lb').addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.remove('active');
          var vid = document.getElementById('lb-vid'); vid.pause(); vid.src = '';
        }
      });

      /* ROOM OF REQUIREMENT */
      var roomUp = false;
      function initRoom() {
        if (roomUp) return; roomUp = true;
        document.getElementById('room-door').addEventListener('click', function () {
          this.classList.add('gone');
          document.getElementById('p-room').classList.add('lit');
          setTimeout(function () {
            var letter = document.getElementById('room-letter');
            letter.style.display = 'block';
            requestAnimationFrame(function () { letter.classList.add('on'); });
            var body = 'To the traveler who has walked these corridors,\nlistened to the rustle of wings in the Owlery,\nand gazed upon the swirling reflections in the Pensieve:\n\nIn Hogwarts, the Room of Requirement only appears when someone truly needs it, bringing them exactly what they need the most in that moment.\n\nThis space was built with love, wonder, and statistical precision. May your own journey always be filled with courage, deep laughter, and quiet moments of magic.\n\nAlways,\nLike magic.';
            var lines = body.split('\n');
            var bd = document.getElementById('room-body');
            var pi = 0;
            function nl() {
              if (pi >= lines.length) {
                document.getElementById('room-sig').textContent = '— Srishti, with love';
                return;
              }
              var ln = lines[pi++];
              if (!ln.trim()) {
                bd.appendChild(document.createElement('br'));
                setTimeout(nl, 250);
                return;
              }
              var p = document.createElement('div');
              p.style.marginBottom = '0.8rem';
              bd.appendChild(p);
              tw(p, ln, nl);
            }
            setTimeout(nl, 800);
          }, 600);
        });
      }

      /* Helpers */
      function tw(el, str, cb, tick) {
        var i = 0;
        function t() {
          if (tick && tick !== currentLtrTick) return;
          if (i <= str.length) { el.textContent = str.slice(0, i); i++; setTimeout(t, 22 + Math.random() * 18); }
          else if (cb) cb();
        }
        t();
      }
      function esc(s) {
        return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

    })();
  