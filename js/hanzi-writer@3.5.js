/**
 * Hanzi Writer v3.5.0 | https://chanind.github.io/hanzi-writer
 */

var HanziWriter = (function () {
  "use strict"
  var t
  const e = "undefined" == typeof window ? global : window,
    r = (e.performance && (() => e.performance.now())) || (() => Date.now()),
    i = e.requestAnimationFrame || ((t) => setTimeout(() => t(r()), 1e3 / 60)),
    s = e.cancelAnimationFrame || clearTimeout
  function o(t) {
    return t[t.length - 1]
  }
  const n = (t, e) => (t < 0 ? e + t : t)
  function a(t, e) {
    const r = { ...t }
    for (const i in e) {
      const s = t[i],
        o = e[i]
      s !== o &&
        (s &&
        o &&
        "object" == typeof s &&
        "object" == typeof o &&
        !Array.isArray(o)
          ? (r[i] = a(s, o))
          : (r[i] = o))
    }
    return r
  }
  let h = 0
  function l() {
    return h++, h
  }
  function c(t) {
    return t.reduce((t, e) => e + t, 0) / t.length
  }
  function d(t) {
    const e = t.toUpperCase().trim()
    if (/^#([A-F0-9]{3}){1,2}$/.test(e)) {
      let t = e.substring(1).split("")
      3 === t.length && (t = [t[0], t[0], t[1], t[1], t[2], t[2]])
      const r = "" + t.join("")
      return {
        r: parseInt(r.slice(0, 2), 16),
        g: parseInt(r.slice(2, 4), 16),
        b: parseInt(r.slice(4, 6), 16),
        a: 1,
      }
    }
    const r = e.match(
      /^RGBA?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d*\.?\d+))?\)$/
    )
    if (r)
      return {
        r: parseInt(r[1], 10),
        g: parseInt(r[2], 10),
        b: parseInt(r[3], 10),
        a: parseFloat(r[4] || 1, 10),
      }
    throw new Error("Invalid color: " + t)
  }
  function u(t, e) {
    const r = {}
    for (let i = 0; i < e; i++) r[i] = t
    return r
  }
  function _(t, e) {
    const r = {}
    for (let i = 0; i < t; i++) r[i] = e(i)
    return r
  }
  const p =
      (null === (t = e.navigator) || void 0 === t ? void 0 : t.userAgent) || "",
    g =
      p.indexOf("MSIE ") > 0 ||
      p.indexOf("Trident/") > 0 ||
      p.indexOf("Edge/") > 0,
    k = () => {}
  class m {
    constructor(t, e, r = k) {
      ;(this._mutationChains = []),
        (this._onStateChange = r),
        (this.state = {
          options: {
            drawingFadeDuration: e.drawingFadeDuration,
            drawingWidth: e.drawingWidth,
            drawingColor: d(e.drawingColor),
            strokeColor: d(e.strokeColor),
            outlineColor: d(e.outlineColor),
            radicalColor: d(e.radicalColor || e.strokeColor),
            highlightColor: d(e.highlightColor),
          },
          character: {
            main: { opacity: e.showCharacter ? 1 : 0, strokes: {} },
            outline: { opacity: e.showOutline ? 1 : 0, strokes: {} },
            highlight: { opacity: 1, strokes: {} },
          },
          userStrokes: null,
        })
      for (let e = 0; e < t.strokes.length; e++)
        (this.state.character.main.strokes[e] = {
          opacity: 1,
          displayPortion: 1,
        }),
          (this.state.character.outline.strokes[e] = {
            opacity: 1,
            displayPortion: 1,
          }),
          (this.state.character.highlight.strokes[e] = {
            opacity: 0,
            displayPortion: 1,
          })
    }
    overwriteOnStateChange(t) {
      this._onStateChange = t
    }
    updateState(t) {
      const e = a(this.state, t)
      this._onStateChange(e, this.state), (this.state = e)
    }
    run(t, e = {}) {
      const r = t.map((t) => t.scope)
      return (
        this.cancelMutations(r),
        new Promise((i) => {
          const s = {
            _isActive: !0,
            _index: 0,
            _resolve: i,
            _mutations: t,
            _loop: e.loop,
            _scopes: r,
          }
          this._mutationChains.push(s), this._run(s)
        })
      )
    }
    _run(t) {
      if (!t._isActive) return
      const e = t._mutations
      if (t._index >= e.length) {
        if (!t._loop)
          return (
            (t._isActive = !1),
            (this._mutationChains = this._mutationChains.filter(
              (e) => e !== t
            )),
            void t._resolve({ canceled: !1 })
          )
        t._index = 0
      }
      t._mutations[t._index].run(this).then(() => {
        t._isActive && (t._index++, this._run(t))
      })
    }
    _getActiveMutations() {
      return this._mutationChains.map((t) => t._mutations[t._index])
    }
    pauseAll() {
      this._getActiveMutations().forEach((t) => t.pause())
    }
    resumeAll() {
      this._getActiveMutations().forEach((t) => t.resume())
    }
    cancelMutations(t) {
      for (const e of this._mutationChains)
        for (const r of e._scopes)
          for (const i of t)
            (r.startsWith(i) || i.startsWith(r)) && this._cancelMutationChain(e)
    }
    cancelAll() {
      this.cancelMutations([""])
    }
    _cancelMutationChain(t) {
      var e
      t._isActive = !1
      for (let e = t._index; e < t._mutations.length; e++)
        t._mutations[e].cancel(this)
      null === (e = t._resolve) || void 0 === e || e.call(t, { canceled: !0 }),
        (this._mutationChains = this._mutationChains.filter((e) => e !== t))
    }
  }
  const f = (t, e) => ({ x: t.x - e.x, y: t.y - e.y }),
    v = (t) => Math.sqrt(Math.pow(t.x, 2) + Math.pow(t.y, 2)),
    y = (t, e) => v(f(t, e)),
    C = (t, e = 1) => {
      const r = 10 * e
      return { x: Math.round(r * t.x) / r, y: Math.round(r * t.y) / r }
    },
    w = (t) => {
      let e = t[0]
      return t.slice(1).reduce((t, r) => {
        const i = y(r, e)
        return (e = r), t + i
      }, 0)
    },
    S = (t, e, r) => {
      const i = f(e, t),
        s = r / v(i)
      return { x: e.x + s * i.x, y: e.y + s * i.y }
    },
    P = (t) => {
      const e = ((t, e = 30) => {
          const r = w(t) / (e - 1),
            i = [t[0]],
            s = o(t),
            n = t.slice(1)
          for (let t = 0; t < e - 2; t++) {
            let t = o(i),
              e = r,
              s = !1
            for (; !s; ) {
              const r = y(t, n[0])
              if (r < e) (e -= r), (t = n.shift())
              else {
                const o = S(t, n[0], e - r)
                i.push(o), (s = !0)
              }
            }
          }
          return i.push(s), i
        })(t),
        r = { x: c(e.map((t) => t.x)), y: c(e.map((t) => t.y)) },
        i = e.map((t) => f(t, r)),
        s = Math.sqrt(
          c([
            Math.pow(i[0].x, 2) + Math.pow(i[0].y, 2),
            Math.pow(o(i).x, 2) + Math.pow(o(i).y, 2),
          ])
        )
      return ((t, e = 0.05) => {
        const r = t.slice(0, 1)
        for (const i of t.slice(1)) {
          const t = r[r.length - 1],
            s = y(i, t)
          if (s > e) {
            const o = Math.ceil(s / e),
              n = s / o
            for (let e = 0; e < o; e++) r.push(S(i, t, -1 * n * (e + 1)))
          } else r.push(i)
        }
        return r
      })(i.map((t) => ({ x: t.x / s, y: t.y / s })))
    }
  function D(t, e = !1) {
    const r = C(t[0]),
      i = t.slice(1)
    let s = `M ${r.x} ${r.y}`
    return (
      i.forEach((t) => {
        const e = C(t)
        s += ` L ${e.x} ${e.y}`
      }),
      e && (s += "Z"),
      s
    )
  }
  const x = (t, e) => {
    const r = ((t) => {
      if (t.length < 3) return t
      const e = [t[0], t[1]]
      return (
        t.slice(2).forEach((t) => {
          const r = e.length,
            i = f(t, e[r - 1]),
            s = f(e[r - 1], e[r - 2])
          i.y * s.x - i.x * s.y == 0 && e.pop(), e.push(t)
        }),
        e
      )
    })(t)
    if (r.length < 2) return r
    const i = r[1],
      s = r[0],
      o = S(i, s, e),
      n = r.slice(1)
    return n.unshift(o), n
  }
  class M {
    constructor(t, e, r, i = !1) {
      ;(this.path = t),
        (this.points = e),
        (this.strokeNum = r),
        (this.isInRadical = i)
    }
    getStartingPoint() {
      return this.points[0]
    }
    getEndingPoint() {
      return this.points[this.points.length - 1]
    }
    getLength() {
      return w(this.points)
    }
    getVectors() {
      let t = this.points[0]
      return this.points.slice(1).map((e) => {
        const r = f(e, t)
        return (t = e), r
      })
    }
    getDistance(t) {
      const e = this.points.map((e) => y(e, t))
      return Math.min(...e)
    }
    getAverageDistance(t) {
      return t.reduce((t, e) => t + this.getDistance(e), 0) / t.length
    }
  }
  class R {
    constructor(t, e) {
      ;(this.symbol = t), (this.strokes = e)
    }
  }
  function T({ radStrokes: t, strokes: e, medians: r }) {
    return e.map((e, i) => {
      const s = r[i].map((t) => {
        const [e, r] = t
        return { x: e, y: r }
      })
      return new M(
        e,
        s,
        i,
        ((o = i),
        (null !== (n = null == t ? void 0 : t.indexOf(o)) && void 0 !== n
          ? n
          : -1) >= 0)
      )
      var o, n
    })
  }
  const [A, O] = [
      { x: 0, y: -124 },
      { x: 1024, y: 900 },
    ],
    b = O.x - A.x,
    $ = O.y - A.y
  class L {
    constructor(t) {
      const { padding: e, width: r, height: i } = t
      ;(this.padding = e), (this.width = r), (this.height = i)
      const s = r - 2 * e,
        o = i - 2 * e,
        n = s / b,
        a = o / $
      this.scale = Math.min(n, a)
      const h = e + (s - this.scale * b) / 2,
        l = e + (o - this.scale * $) / 2
      ;(this.xOffset = -1 * A.x * this.scale + h),
        (this.yOffset = -1 * A.y * this.scale + l)
    }
    convertExternalPoint(t) {
      return {
        x: (t.x - this.xOffset) / this.scale,
        y: (this.height - this.yOffset - t.y) / this.scale,
      }
    }
  }
  const z = (t, e) => {
      const r = ((t) => {
          const e = []
          let r = t[0]
          return (
            t.slice(1).forEach((t) => {
              e.push(f(t, r)), (r = t)
            }),
            e
          )
        })(t),
        i = e.getVectors()
      return (
        c(
          r.map((t) => {
            const e = i.map((e) => {
              return (i = t), ((r = e).x * i.x + r.y * i.y) / v(r) / v(i)
              var r, i
            })
            return Math.max(...e)
          })
        ) > 0
      )
    },
    E = (t) => {
      if (t.length < 2) return t
      const [e, ...r] = t,
        i = [e]
      for (const t of r)
        (s = t),
          (o = i[i.length - 1]),
          (s.x !== o.x || s.y !== o.y) && i.push(t)
      var s, o
      return i
    },
    W = [
      Math.PI / 16,
      Math.PI / 32,
      0,
      (-1 * Math.PI) / 32,
      (-1 * Math.PI) / 16,
    ],
    F = (t, e, r) => {
      const i = P(t),
        s = P(e)
      let o = 1 / 0
      return (
        W.forEach((t) => {
          const e = ((t, e) => {
            const r = t.length >= e.length ? t : e,
              i = t.length >= e.length ? e : t,
              s = (t, e, s, o) => {
                if (0 === t && 0 === e) return y(r[0], i[0])
                if (t > 0 && 0 === e) return Math.max(s[0], y(r[t], i[0]))
                const n = o[o.length - 1]
                return 0 === t && e > 0
                  ? Math.max(n, y(r[0], i[e]))
                  : Math.max(Math.min(s[e], s[e - 1], n), y(r[t], i[e]))
              }
            let o = []
            for (let t = 0; t < r.length; t++) {
              const e = []
              for (let r = 0; r < i.length; r++) e.push(s(t, r, o, e))
              o = e
            }
            return o[i.length - 1]
          })(
            i,
            ((t, e) =>
              t.map((t) => ({
                x: Math.cos(e) * t.x - Math.sin(e) * t.y,
                y: Math.sin(e) * t.x + Math.cos(e) * t.y,
              })))(s, t)
          )
          e < o && (o = e)
        }),
        o <= 0.4 * r
      )
    },
    H = (t, e, r) => {
      const {
          leniency: i = 1,
          isOutlineVisible: s = !1,
          checkBackwards: o = !0,
        } = r,
        n = e.getAverageDistance(t),
        a = n <= 350 * (s || e.strokeNum > 0 ? 0.5 : 1) * i
      if (!a)
        return { isMatch: !1, avgDist: n, meta: { isStrokeBackwards: !1 } }
      const h = ((t, e, r) => {
          const i = y(e.getStartingPoint(), t[0]),
            s = y(e.getEndingPoint(), t[t.length - 1])
          return i <= 250 * r && s <= 250 * r
        })(t, e, i),
        l = z(t, e),
        c = F(t, e.points, i),
        d = ((t, e, r) => (r * (w(t) + 25)) / (e.getLength() + 25) >= 0.35)(
          t,
          e,
          i
        ),
        u = a && h && l && c && d
      if (o && !u) {
        if (H([...t].reverse(), e, { ...r, checkBackwards: !1 }).isMatch)
          return { isMatch: u, avgDist: n, meta: { isStrokeBackwards: !0 } }
      }
      return { isMatch: u, avgDist: n, meta: { isStrokeBackwards: !1 } }
    }
  class I {
    constructor(t, e, r) {
      ;(this.id = t), (this.points = [e]), (this.externalPoints = [r])
    }
    appendPoint(t, e) {
      this.points.push(t), this.externalPoints.push(e)
    }
  }
  class B {
    constructor(t, e, r = {}) {
      ;(this._tick = (t) => {
        if (null !== this._startPauseTime) return
        const e = Math.min(
          1,
          (t - this._startTime - this._pausedDuration) / this._duration
        )
        if (1 === e)
          this._renderState.updateState(this._values),
            (this._frameHandle = void 0),
            this.cancel(this._renderState)
        else {
          const t = j(e),
            r = q(this._startState, this._values, t)
          this._renderState.updateState(r), (this._frameHandle = i(this._tick))
        }
      }),
        (this.scope = t),
        (this._valuesOrCallable = e),
        (this._duration = r.duration || 0),
        (this._force = r.force),
        (this._pausedDuration = 0),
        (this._startPauseTime = null)
    }
    run(t) {
      return (
        this._values || this._inflateValues(t),
        0 === this._duration && t.updateState(this._values),
        0 === this._duration || N(t.state, this._values)
          ? Promise.resolve()
          : ((this._renderState = t),
            (this._startState = t.state),
            (this._startTime = performance.now()),
            (this._frameHandle = i(this._tick)),
            new Promise((t) => {
              this._resolve = t
            }))
      )
    }
    _inflateValues(t) {
      let e = this._valuesOrCallable
      "function" == typeof this._valuesOrCallable &&
        (e = this._valuesOrCallable(t.state)),
        (this._values = (function (t, e) {
          const r = t.split("."),
            i = {}
          let s = i
          for (let t = 0; t < r.length; t++) {
            const i = t === r.length - 1 ? e : {}
            ;(s[r[t]] = i), (s = i)
          }
          return i
        })(this.scope, e))
    }
    pause() {
      null === this._startPauseTime &&
        (this._frameHandle && s(this._frameHandle),
        (this._startPauseTime = performance.now()))
    }
    resume() {
      null !== this._startPauseTime &&
        ((this._frameHandle = i(this._tick)),
        (this._pausedDuration += performance.now() - this._startPauseTime),
        (this._startPauseTime = null))
    }
    cancel(t) {
      var e
      null === (e = this._resolve) || void 0 === e || e.call(this),
        (this._resolve = void 0),
        s(this._frameHandle || -1),
        (this._frameHandle = void 0),
        this._force &&
          (this._values || this._inflateValues(t), t.updateState(this._values))
    }
  }
  function q(t, e, r) {
    const i = {}
    for (const s in e) {
      const o = e[s],
        n = null == t ? void 0 : t[s]
      i[s] =
        "number" == typeof n && "number" == typeof o && o >= 0
          ? r * (o - n) + n
          : q(n, o, r)
    }
    return i
  }
  function N(t, e) {
    for (const r in e) {
      const i = e[r],
        s = null == t ? void 0 : t[r]
      if (i >= 0) {
        if (i !== s) return !1
      } else if (!N(s, i)) return !1
    }
    return !0
  }
  B.Delay = class {
    constructor(t) {
      ;(this._duration = t),
        (this._startTime = null),
        (this._paused = !1),
        (this.scope = "delay." + t)
    }
    run() {
      return (
        (this._startTime = r()),
        (this._runningPromise = new Promise((t) => {
          ;(this._resolve = t),
            (this._timeout = setTimeout(() => this.cancel(), this._duration))
        })),
        this._runningPromise
      )
    }
    pause() {
      if (this._paused) return
      const t = performance.now() - (this._startTime || 0)
      ;(this._duration = Math.max(0, this._duration - t)),
        clearTimeout(this._timeout),
        (this._paused = !0)
    }
    resume() {
      this._paused &&
        ((this._startTime = performance.now()),
        (this._timeout = setTimeout(() => this.cancel(), this._duration)),
        (this._paused = !1))
    }
    cancel() {
      clearTimeout(this._timeout),
        this._resolve && this._resolve(),
        (this._resolve = void 0)
    }
  }
  const j = (t) => -Math.cos(t * Math.PI) / 2 + 0.5,
    U = (t, e, r) => [
      new B(
        `character.${t}.strokes`,
        u({ opacity: 1, displayPortion: 1 }, e.strokes.length),
        { duration: r, force: !0 }
      ),
    ],
    V = (t, e, r) => [
      new B(
        "character." + t,
        {
          opacity: 1,
          strokes: u({ opacity: 1, displayPortion: 1 }, e.strokes.length),
        },
        { duration: r, force: !0 }
      ),
    ],
    Q = (t, e, r) => [
      new B(`character.${t}.opacity`, 0, { duration: r, force: !0 }),
      ...U(t, e, 0),
    ],
    G = (t, e, r) => [new B("options." + t, e, { duration: r })],
    X = (t, e, r) => {
      const i = t.strokeNum,
        s = (t.getLength() + 600) / (3 * r)
      return [
        new B("options.highlightColor", e),
        new B("character.highlight", {
          opacity: 1,
          strokes: { [i]: { displayPortion: 0, opacity: 0 } },
        }),
        new B(
          "character.highlight.strokes." + i,
          { displayPortion: 1, opacity: 1 },
          { duration: s }
        ),
        new B(`character.highlight.strokes.${i}.opacity`, 0, {
          duration: s,
          force: !0,
        }),
      ]
    },
    K = (t, e, r) => {
      const i = e.strokeNum,
        s = (e.getLength() + 600) / (3 * r)
      return [
        new B("character." + t, {
          opacity: 1,
          strokes: { [i]: { displayPortion: 0, opacity: 1 } },
        }),
        new B(`character.${t}.strokes.${i}.displayPortion`, 1, { duration: s }),
      ]
    },
    Y = (t, e, r, i, s) => {
      let o = Q(t, e, r)
      return (
        (o = o.concat(U(t, e, 0))),
        o.push(
          new B(
            "character." + t,
            { opacity: 1, strokes: u({ opacity: 0 }, e.strokes.length) },
            { force: !0 }
          )
        ),
        e.strokes.forEach((e, r) => {
          r > 0 && o.push(new B.Delay(s)), (o = o.concat(K(t, e, i)))
        }),
        o
      )
    },
    J = (t, e) => [
      new B(`userStrokes.${t}.opacity`, 0, { duration: e }),
      new B("userStrokes." + t, null, { force: !0 }),
    ]
  class Z {
    constructor(t, e, r) {
      ;(this._currentStrokeIndex = 0),
        (this._mistakesOnStroke = 0),
        (this._totalMistakes = 0),
        (this._character = t),
        (this._renderState = e),
        (this._isActive = !1),
        (this._positioner = r)
    }
    startQuiz(t) {
      ;(this._isActive = !0), (this._options = t)
      const e = n(t.quizStartStrokeNum, this._character.strokes.length)
      return (
        (this._currentStrokeIndex = Math.min(
          e,
          this._character.strokes.length - 1
        )),
        (this._mistakesOnStroke = 0),
        (this._totalMistakes = 0),
        this._renderState.run(
          ((r = this._character),
          (i = t.strokeFadeDuration),
          (s = this._currentStrokeIndex),
          [
            ...Q("main", r, i),
            new B(
              "character.highlight",
              { opacity: 1, strokes: u({ opacity: 0 }, r.strokes.length) },
              { force: !0 }
            ),
            new B(
              "character.main",
              {
                opacity: 1,
                strokes: _(r.strokes.length, (t) => ({
                  opacity: t < s ? 1 : 0,
                })),
              },
              { force: !0 }
            ),
          ])
        )
      )
      var r, i, s
    }
    startUserStroke(t) {
      if (!this._isActive) return null
      if (this._userStroke) return this.endUserStroke()
      const e = this._positioner.convertExternalPoint(t),
        r = l()
      return (
        (this._userStroke = new I(r, e, t)),
        this._renderState.run(
          ((t, e) => [
            new B("quiz.activeUserStrokeId", t, { force: !0 }),
            new B(
              "userStrokes." + t,
              { points: [e], opacity: 1 },
              { force: !0 }
            ),
          ])(r, e)
        )
      )
    }
    continueUserStroke(t) {
      if (!this._userStroke) return Promise.resolve()
      const e = this._positioner.convertExternalPoint(t)
      this._userStroke.appendPoint(e, t)
      const r = this._userStroke.points.slice(0)
      return this._renderState.run(
        ((i = this._userStroke.id),
        [new B(`userStrokes.${i}.points`, r, { force: !0 })])
      )
      var i
    }
    setPositioner(t) {
      this._positioner = t
    }
    endUserStroke() {
      var t
      if (!this._userStroke) return
      if (
        (this._renderState.run(
          J(
            this._userStroke.id,
            null !== (t = this._options.drawingFadeDuration) && void 0 !== t
              ? t
              : 300
          )
        ),
        1 === this._userStroke.points.length)
      )
        return void (this._userStroke = void 0)
      const { acceptBackwardsStrokes: e, markStrokeCorrectAfterMisses: r } =
          this._options,
        i = this._getCurrentStroke(),
        { isMatch: s, meta: o } = (function (t, e, r, i = {}) {
          const s = e.strokes,
            o = E(t.points)
          if (o.length < 2)
            return { isMatch: !1, meta: { isStrokeBackwards: !1 } }
          const { isMatch: n, meta: a, avgDist: h } = H(o, s[r], i)
          if (!n) return { isMatch: n, meta: a }
          const l = s.slice(r + 1)
          let c = h
          for (let t = 0; t < l.length; t++) {
            const { isMatch: e, avgDist: r } = H(o, l[t], {
              ...i,
              checkBackwards: !1,
            })
            e && r < c && (c = r)
          }
          if (c < h) {
            const t = (0.6 * (c + h)) / (2 * h),
              { isMatch: e, meta: n } = H(o, s[r], {
                ...i,
                leniency: (i.leniency || 1) * t,
              })
            return { isMatch: e, meta: n }
          }
          return { isMatch: n, meta: a }
        })(this._userStroke, this._character, this._currentStrokeIndex, {
          isOutlineVisible:
            this._renderState.state.character.outline.opacity > 0,
          leniency: this._options.leniency,
        }),
        n = r && this._mistakesOnStroke + 1 >= r
      if (s || n || (o.isStrokeBackwards && e)) this._handleSuccess(o)
      else {
        this._handleFailure(o)
        const {
          showHintAfterMisses: t,
          highlightColor: e,
          strokeHighlightSpeed: r,
        } = this._options
        !1 !== t &&
          this._mistakesOnStroke >= t &&
          this._renderState.run(X(i, d(e), r))
      }
      this._userStroke = void 0
    }
    cancel() {
      ;(this._isActive = !1),
        this._userStroke &&
          this._renderState.run(
            J(this._userStroke.id, this._options.drawingFadeDuration)
          )
    }
    _getStrokeData({ isCorrect: t, meta: e }) {
      return {
        character: this._character.symbol,
        strokeNum: this._currentStrokeIndex,
        mistakesOnStroke: this._mistakesOnStroke,
        totalMistakes: this._totalMistakes,
        strokesRemaining:
          this._character.strokes.length -
          this._currentStrokeIndex -
          (t ? 1 : 0),
        drawnPath:
          ((r = this._userStroke),
          {
            pathString: D(r.externalPoints),
            points: r.points.map((t) => C(t)),
          }),
        isBackwards: e.isStrokeBackwards,
      }
      var r
    }
    _handleSuccess(t) {
      if (!this._options) return
      const { strokes: e, symbol: r } = this._character,
        {
          onCorrectStroke: i,
          onComplete: s,
          highlightOnComplete: o,
          strokeFadeDuration: n,
          highlightCompleteColor: a,
          highlightColor: h,
          strokeHighlightDuration: l,
        } = this._options
      null == i || i({ ...this._getStrokeData({ isCorrect: !0, meta: t }) })
      let c =
        ((u = "main"),
        (_ = this._currentStrokeIndex),
        [
          new B(
            `character.${u}.strokes.${_}`,
            { displayPortion: 1, opacity: 1 },
            { duration: n, force: !0 }
          ),
        ])
      var u, _
      ;(this._mistakesOnStroke = 0), (this._currentStrokeIndex += 1)
      this._currentStrokeIndex === e.length &&
        ((this._isActive = !1),
        null == s || s({ character: r, totalMistakes: this._totalMistakes }),
        o &&
          (c = c.concat(
            ((t, e, r) => [
              new B("options.highlightColor", e),
              ...Q("highlight", t),
              ...V("highlight", t, r / 2),
              ...Q("highlight", t, r / 2),
            ])(this._character, d(a || h), 2 * (l || 0))
          ))),
        this._renderState.run(c)
    }
    _handleFailure(t) {
      var e, r
      ;(this._mistakesOnStroke += 1),
        (this._totalMistakes += 1),
        null === (e = (r = this._options).onMistake) ||
          void 0 === e ||
          e.call(r, this._getStrokeData({ isCorrect: !1, meta: t }))
    }
    _getCurrentStroke() {
      return this._character.strokes[this._currentStrokeIndex]
    }
  }
  function tt(t) {
    return document.createElementNS("http://www.w3.org/2000/svg", t)
  }
  function et(t, e, r) {
    t.setAttributeNS(null, e, r)
  }
  function rt(t, e) {
    Object.keys(e).forEach((r) => et(t, r, e[r]))
  }
  function it(t) {
    var e
    null == t || null === (e = t.parentNode) || void 0 === e || e.removeChild(t)
  }
  class st {
    constructor(t) {
      ;(this.stroke = t),
        (this._pathLength = t.getLength() + st.STROKE_WIDTH / 2)
    }
    _getStrokeDashoffset(t) {
      return 0.999 * this._pathLength * (1 - t)
    }
    _getColor({ strokeColor: t, radicalColor: e }) {
      return e && this.stroke.isInRadical ? e : t
    }
  }
  st.STROKE_WIDTH = 200
  class ot extends st {
    constructor(t) {
      super(t), (this._oldProps = void 0)
    }
    mount(t) {
      ;(this._animationPath = tt("path")),
        (this._clip = tt("clipPath")),
        (this._strokePath = tt("path"))
      const e = "mask-" + l()
      et(this._clip, "id", e),
        et(this._strokePath, "d", this.stroke.path),
        (this._animationPath.style.opacity = "0"),
        et(
          this._animationPath,
          "clip-path",
          (function (t) {
            let e = ""
            return (
              window.location &&
                window.location.href &&
                (e = window.location.href
                  .replace(/#[^#]*$/, "")
                  .replace(/"/gi, "%22")),
              `url("${e}#${t}")`
            )
          })(e)
        )
      const r = x(this.stroke.points, 100)
      return (
        et(this._animationPath, "d", D(r)),
        rt(this._animationPath, {
          stroke: "#FFFFFF",
          "stroke-width": (200).toString(),
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "miter",
          "stroke-dasharray": `${this._pathLength},${this._pathLength}`,
        }),
        this._clip.appendChild(this._strokePath),
        t.defs.appendChild(this._clip),
        t.svg.appendChild(this._animationPath),
        this
      )
    }
    render(t) {
      var e, r
      if (t === this._oldProps || !this._animationPath) return
      t.displayPortion !==
        (null === (e = this._oldProps) || void 0 === e
          ? void 0
          : e.displayPortion) &&
        (this._animationPath.style.strokeDashoffset = this._getStrokeDashoffset(
          t.displayPortion
        ).toString())
      const i = this._getColor(t)
      if (!this._oldProps || i !== this._getColor(this._oldProps)) {
        const { r: t, g: e, b: r, a: s } = i
        rt(this._animationPath, { stroke: `rgba(${t},${e},${r},${s})` })
      }
      t.opacity !==
        (null === (r = this._oldProps) || void 0 === r ? void 0 : r.opacity) &&
        (this._animationPath.style.opacity = t.opacity.toString()),
        (this._oldProps = t)
    }
  }
  class nt {
    constructor(t) {
      ;(this._oldProps = void 0),
        (this._strokeRenderers = t.strokes.map((t) => new ot(t)))
    }
    mount(t) {
      const e = t.createSubRenderTarget()
      ;(this._group = e.svg),
        this._strokeRenderers.forEach((t) => {
          t.mount(e)
        })
    }
    render(t) {
      var e, r
      if (t === this._oldProps || !this._group) return
      const {
        opacity: i,
        strokes: s,
        strokeColor: o,
        radicalColor: n = null,
      } = t
      var a
      i !==
        (null === (e = this._oldProps) || void 0 === e ? void 0 : e.opacity) &&
        ((this._group.style.opacity = i.toString()),
        g ||
          (0 === i
            ? (this._group.style.display = "none")
            : 0 ===
                (null === (a = this._oldProps) || void 0 === a
                  ? void 0
                  : a.opacity) && this._group.style.removeProperty("display")))
      const h =
        !this._oldProps ||
        o !== this._oldProps.strokeColor ||
        n !== this._oldProps.radicalColor
      if (
        h ||
        s !==
          (null === (r = this._oldProps) || void 0 === r ? void 0 : r.strokes)
      )
        for (let t = 0; t < this._strokeRenderers.length; t++) {
          var l
          ;(!h &&
            null !== (l = this._oldProps) &&
            void 0 !== l &&
            l.strokes &&
            s[t] === this._oldProps.strokes[t]) ||
            this._strokeRenderers[t].render({
              strokeColor: o,
              radicalColor: n,
              opacity: s[t].opacity,
              displayPortion: s[t].displayPortion,
            })
        }
      this._oldProps = t
    }
  }
  class at {
    constructor() {
      this._oldProps = void 0
    }
    mount(t) {
      ;(this._path = tt("path")), t.svg.appendChild(this._path)
    }
    render(t) {
      var e, r, i, s
      if (this._path && t !== this._oldProps) {
        if (
          t.strokeColor !==
            (null === (e = this._oldProps) || void 0 === e
              ? void 0
              : e.strokeColor) ||
          t.strokeWidth !==
            (null === (r = this._oldProps) || void 0 === r
              ? void 0
              : r.strokeWidth)
        ) {
          const { r: e, g: r, b: i, a: s } = t.strokeColor
          rt(this._path, {
            fill: "none",
            stroke: `rgba(${e},${r},${i},${s})`,
            "stroke-width": t.strokeWidth.toString(),
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          })
        }
        t.opacity !==
          (null === (i = this._oldProps) || void 0 === i
            ? void 0
            : i.opacity) && et(this._path, "opacity", t.opacity.toString()),
          t.points !==
            (null === (s = this._oldProps) || void 0 === s
              ? void 0
              : s.points) && et(this._path, "d", D(t.points)),
          (this._oldProps = t)
      }
    }
    destroy() {
      it(this._path)
    }
  }
  class ht {
    constructor(t) {
      this.node = t
    }
    addPointerStartListener(t) {
      this.node.addEventListener("mousedown", (e) => {
        t(this._eventify(e, this._getMousePoint))
      }),
        this.node.addEventListener("touchstart", (e) => {
          t(this._eventify(e, this._getTouchPoint))
        })
    }
    addPointerMoveListener(t) {
      this.node.addEventListener("mousemove", (e) => {
        t(this._eventify(e, this._getMousePoint))
      }),
        this.node.addEventListener("touchmove", (e) => {
          t(this._eventify(e, this._getTouchPoint))
        })
    }
    addPointerEndListener(t) {
      document.addEventListener("mouseup", t),
        document.addEventListener("touchend", t)
    }
    getBoundingClientRect() {
      return this.node.getBoundingClientRect()
    }
    updateDimensions(t, e) {
      this.node.setAttribute("width", "" + t),
        this.node.setAttribute("height", "" + e)
    }
    _eventify(t, e) {
      return {
        getPoint: () => e.call(this, t),
        preventDefault: () => t.preventDefault(),
      }
    }
    _getMousePoint(t) {
      const { left: e, top: r } = this.getBoundingClientRect()
      return { x: t.clientX - e, y: t.clientY - r }
    }
    _getTouchPoint(t) {
      const { left: e, top: r } = this.getBoundingClientRect()
      return { x: t.touches[0].clientX - e, y: t.touches[0].clientY - r }
    }
  }
  class lt extends ht {
    constructor(t, e) {
      super(t),
        (this.svg = t),
        (this.defs = e),
        "createSVGPoint" in t && (this._pt = t.createSVGPoint())
    }
    static init(t, e = "100%", r = "100%") {
      const i = "string" == typeof t ? document.getElementById(t) : t
      if (!i) throw new Error("HanziWriter target element not found: " + t)
      const s = i.nodeName.toUpperCase(),
        o = (() => {
          if ("SVG" === s || "G" === s) return i
          {
            const t = tt("svg")
            return i.appendChild(t), t
          }
        })()
      rt(o, { width: e, height: r })
      const n = tt("defs")
      return o.appendChild(n), new lt(o, n)
    }
    createSubRenderTarget() {
      const t = tt("g")
      return this.svg.appendChild(t), new lt(t, this.defs)
    }
    _getMousePoint(t) {
      if (
        this._pt &&
        ((this._pt.x = t.clientX),
        (this._pt.y = t.clientY),
        "getScreenCTM" in this.node)
      ) {
        var e
        const t = this._pt.matrixTransform(
          null === (e = this.node.getScreenCTM()) || void 0 === e
            ? void 0
            : e.inverse()
        )
        return { x: t.x, y: t.y }
      }
      return super._getMousePoint.call(this, t)
    }
    _getTouchPoint(t) {
      if (
        this._pt &&
        ((this._pt.x = t.touches[0].clientX),
        (this._pt.y = t.touches[0].clientY),
        "getScreenCTM" in this.node)
      ) {
        var e
        const t = this._pt.matrixTransform(
          null === (e = this.node.getScreenCTM()) || void 0 === e
            ? void 0
            : e.inverse()
        )
        return { x: t.x, y: t.y }
      }
      return super._getTouchPoint(t)
    }
  }
  var ct = {
    HanziWriterRenderer: class {
      constructor(t, e) {
        ;(this._character = t),
          (this._positioner = e),
          (this._mainCharRenderer = new nt(t)),
          (this._outlineCharRenderer = new nt(t)),
          (this._highlightCharRenderer = new nt(t)),
          (this._userStrokeRenderers = {})
      }
      mount(t) {
        const e = t.createSubRenderTarget(),
          r = e.svg,
          { xOffset: i, yOffset: s, height: o, scale: n } = this._positioner
        et(r, "transform", `translate(${i}, ${o - s}) scale(${n}, ${-1 * n})`),
          this._outlineCharRenderer.mount(e),
          this._mainCharRenderer.mount(e),
          this._highlightCharRenderer.mount(e),
          (this._positionedTarget = e)
      }
      render(t) {
        const { main: e, outline: r, highlight: i } = t.character,
          {
            outlineColor: s,
            radicalColor: o,
            highlightColor: n,
            strokeColor: a,
            drawingWidth: h,
            drawingColor: l,
          } = t.options
        this._outlineCharRenderer.render({
          opacity: r.opacity,
          strokes: r.strokes,
          strokeColor: s,
        }),
          this._mainCharRenderer.render({
            opacity: e.opacity,
            strokes: e.strokes,
            strokeColor: a,
            radicalColor: o,
          }),
          this._highlightCharRenderer.render({
            opacity: i.opacity,
            strokes: i.strokes,
            strokeColor: n,
          })
        const c = t.userStrokes || {}
        for (const t in this._userStrokeRenderers) {
          var d
          if (!c[t])
            null === (d = this._userStrokeRenderers[t]) ||
              void 0 === d ||
              d.destroy(),
              delete this._userStrokeRenderers[t]
        }
        for (const t in c) {
          const e = c[t]
          if (!e) continue
          const r = { strokeWidth: h, strokeColor: l, ...e }
          ;(() => {
            if (this._userStrokeRenderers[t])
              return this._userStrokeRenderers[t]
            const e = new at()
            return (
              e.mount(this._positionedTarget),
              (this._userStrokeRenderers[t] = e),
              e
            )
          })().render(r)
        }
      }
      destroy() {
        it(this._positionedTarget.svg),
          (this._positionedTarget.defs.innerHTML = "")
      }
    },
    createRenderTarget: lt.init,
  }
  const dt = (t, e) => {
    t.beginPath()
    const r = e[0],
      i = e.slice(1)
    t.moveTo(r.x, r.y)
    for (const e of i) t.lineTo(e.x, e.y)
    t.stroke()
  }
  class ut extends st {
    constructor(t, e = !0) {
      super(t),
        e && Path2D
          ? (this._path2D = new Path2D(this.stroke.path))
          : (this._pathCmd = ((t) => {
              const e = t.split(/(^|\s+)(?=[A-Z])/).filter((t) => " " !== t),
                r = [(t) => t.beginPath()]
              for (const t of e) {
                const [e, ...i] = t.split(/\s+/),
                  s = i.map((t) => parseFloat(t))
                "M" === e
                  ? r.push((t) => t.moveTo(...s))
                  : "L" === e
                  ? r.push((t) => t.lineTo(...s))
                  : "C" === e
                  ? r.push((t) => t.bezierCurveTo(...s))
                  : "Q" === e && r.push((t) => t.quadraticCurveTo(...s))
              }
              return (t) => r.forEach((e) => e(t))
            })(this.stroke.path)),
        (this._extendedMaskPoints = x(this.stroke.points, st.STROKE_WIDTH / 2))
    }
    render(t, e) {
      if (e.opacity < 0.05) return
      var r
      ;(t.save(), this._path2D)
        ? t.clip(this._path2D)
        : (null === (r = this._pathCmd) || void 0 === r || r.call(this, t),
          (t.globalAlpha = 0),
          t.stroke(),
          t.clip())
      const { r: i, g: s, b: o, a: n } = this._getColor(e),
        a = 1 === n ? `rgb(${i},${s},${o})` : `rgb(${i},${s},${o},${n})`,
        h = this._getStrokeDashoffset(e.displayPortion)
      ;(t.globalAlpha = e.opacity),
        (t.strokeStyle = a),
        (t.fillStyle = a),
        (t.lineWidth = st.STROKE_WIDTH),
        (t.lineCap = "round"),
        (t.lineJoin = "round"),
        t.setLineDash([this._pathLength, this._pathLength], h),
        (t.lineDashOffset = h),
        dt(t, this._extendedMaskPoints),
        t.restore()
    }
  }
  class _t {
    constructor(t) {
      this._strokeRenderers = t.strokes.map((t) => new ut(t))
    }
    render(t, e) {
      if (e.opacity < 0.05) return
      const { opacity: r, strokeColor: i, radicalColor: s, strokes: o } = e
      for (let e = 0; e < this._strokeRenderers.length; e++)
        this._strokeRenderers[e].render(t, {
          strokeColor: i,
          radicalColor: s,
          opacity: o[e].opacity * r,
          displayPortion: o[e].displayPortion || 0,
        })
    }
  }
  function pt(t, e) {
    if (e.opacity < 0.05) return
    const { opacity: r, strokeWidth: i, strokeColor: s, points: o } = e,
      { r: n, g: a, b: h, a: l } = s
    t.save(),
      (t.globalAlpha = r),
      (t.lineWidth = i),
      (t.strokeStyle = `rgba(${n},${a},${h},${l})`),
      (t.lineCap = "round"),
      (t.lineJoin = "round"),
      dt(t, o),
      t.restore()
  }
  class gt extends ht {
    constructor(t) {
      super(t)
    }
    static init(t, e = "100%", r = "100%") {
      const i = "string" == typeof t ? document.getElementById(t) : t
      if (!i) throw new Error("HanziWriter target element not found: " + t)
      const s = i.nodeName.toUpperCase(),
        o = (() => {
          if ("CANVAS" === s) return i
          const t = document.createElement("canvas")
          return i.appendChild(t), t
        })()
      return o.setAttribute("width", e), o.setAttribute("height", r), new gt(o)
    }
    getContext() {
      return this.node.getContext("2d")
    }
  }
  var kt = {
    HanziWriterRenderer: class {
      constructor(t, e) {
        ;(this.destroy = k),
          (this._character = t),
          (this._positioner = e),
          (this._mainCharRenderer = new _t(t)),
          (this._outlineCharRenderer = new _t(t)),
          (this._highlightCharRenderer = new _t(t))
      }
      mount(t) {
        this._target = t
      }
      _animationFrame(t) {
        const {
            width: e,
            height: r,
            scale: i,
            xOffset: s,
            yOffset: o,
          } = this._positioner,
          n = this._target.getContext()
        n.clearRect(0, 0, e, r),
          n.save(),
          n.translate(s, r - o),
          n.transform(1, 0, 0, -1, 0, 0),
          n.scale(i, i),
          t(n),
          n.restore(),
          n.draw && n.draw()
      }
      render(t) {
        const { outline: e, main: r, highlight: i } = t.character,
          {
            outlineColor: s,
            strokeColor: o,
            radicalColor: n,
            highlightColor: a,
            drawingColor: h,
            drawingWidth: l,
          } = t.options
        this._animationFrame((c) => {
          this._outlineCharRenderer.render(c, {
            opacity: e.opacity,
            strokes: e.strokes,
            strokeColor: s,
          }),
            this._mainCharRenderer.render(c, {
              opacity: r.opacity,
              strokes: r.strokes,
              strokeColor: o,
              radicalColor: n,
            }),
            this._highlightCharRenderer.render(c, {
              opacity: i.opacity,
              strokes: i.strokes,
              strokeColor: a,
            })
          const d = t.userStrokes || {}
          for (const t in d) {
            const e = d[t]
            if (e) {
              pt(c, { strokeWidth: l, strokeColor: h, ...e })
            }
          }
        })
      }
    },
    createRenderTarget: gt.init,
  }
  const mt = {
    charDataLoader: (t, e, r) => {
      const i = new XMLHttpRequest()
      i.overrideMimeType && i.overrideMimeType("application/json"),
        i.open(
          "GET",
          ((t) =>
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${t}.json`)(t),
          !0
        ),
        (i.onerror = (t) => {
          r(i, t)
        }),
        (i.onreadystatechange = () => {
          4 === i.readyState &&
            (200 === i.status
              ? e(JSON.parse(i.responseText))
              : 0 !== i.status && r && r(i))
        }),
        i.send(null)
    },
    onLoadCharDataError: null,
    onLoadCharDataSuccess: null,
    showOutline: !0,
    showCharacter: !0,
    renderer: "svg",
    width: 0,
    height: 0,
    padding: 20,
    strokeAnimationSpeed: 1,
    strokeFadeDuration: 400,
    strokeHighlightDuration: 200,
    strokeHighlightSpeed: 2,
    delayBetweenStrokes: 1e3,
    delayBetweenLoops: 2e3,
    strokeColor: "#555",
    radicalColor: null,
    highlightColor: "#AAF",
    outlineColor: "#DDD",
    drawingColor: "#333",
    leniency: 1,
    showHintAfterMisses: 3,
    highlightOnComplete: !0,
    highlightCompleteColor: null,
    markStrokeCorrectAfterMisses: !1,
    acceptBackwardsStrokes: !1,
    quizStartStrokeNum: 0,
    drawingFadeDuration: 300,
    drawingWidth: 4,
    strokeWidth: 2,
    outlineWidth: 2,
    rendererOverride: {},
  }
  class ft {
    constructor(t) {
      ;(this._loadCounter = 0),
        (this._isLoading = !1),
        (this.loadingFailed = !1),
        (this._options = t)
    }
    _debouncedLoad(t, e) {
      const r = (t) => {
          var r
          e === this._loadCounter &&
            (null === (r = this._resolve) || void 0 === r || r.call(this, t))
        },
        i = (t) => {
          var r
          e === this._loadCounter &&
            (null === (r = this._reject) || void 0 === r || r.call(this, t))
        },
        s = this._options.charDataLoader(t, r, i)
      s && ("then" in s ? s.then(r).catch(i) : r(s))
    }
    _setupLoadingPromise() {
      return new Promise((t, e) => {
        ;(this._resolve = t), (this._reject = e)
      })
        .then((t) => {
          var e, r
          return (
            (this._isLoading = !1),
            null === (e = (r = this._options).onLoadCharDataSuccess) ||
              void 0 === e ||
              e.call(r, t),
            t
          )
        })
        .catch((t) => {
          if (
            ((this._isLoading = !1),
            (this.loadingFailed = !0),
            this._options.onLoadCharDataError)
          )
            return void this._options.onLoadCharDataError(t)
          if (t instanceof Error) throw t
          const e = new Error(
            "Failed to load char data for " + this._loadingChar
          )
          throw ((e.reason = t), e)
        })
    }
    loadCharData(t) {
      this._loadingChar = t
      const e = this._setupLoadingPromise()
      return (
        (this.loadingFailed = !1),
        (this._isLoading = !0),
        this._loadCounter++,
        this._debouncedLoad(t, this._loadCounter),
        e
      )
    }
  }
  class vt {
    constructor(t, e = {}) {
      const { HanziWriterRenderer: r, createRenderTarget: i } =
          "canvas" === e.renderer ? kt : ct,
        s = e.rendererOverride || {}
      ;(this._renderer = {
        HanziWriterRenderer: s.HanziWriterRenderer || r,
        createRenderTarget: s.createRenderTarget || i,
      }),
        (this.target = this._renderer.createRenderTarget(t, e.width, e.height)),
        (this._options = this._assignOptions(e)),
        (this._loadingManager = new ft(this._options)),
        this._setupListeners()
    }
    static create(t, e, r) {
      const i = new vt(t, r)
      return i.setCharacter(e), i
    }
    static loadCharacterData(t, e = {}) {
      const r = (() => {
        const { _loadingManager: r, _loadingOptions: i } = vt
        return (null == r ? void 0 : r._loadingChar) === t && i === e
          ? r
          : new ft({ ...mt, ...e })
      })()
      return (
        (vt._loadingManager = r), (vt._loadingOptions = e), r.loadCharData(t)
      )
    }
    static getScalingTransform(t, e, r = 0) {
      const i = new L({ width: t, height: e, padding: r })
      return {
        x: i.xOffset,
        y: i.yOffset,
        scale: i.scale,
        transform: ((s = `\n        translate(${i.xOffset}, ${
          i.height - i.yOffset
        })\n        scale(${i.scale}, ${-1 * i.scale})\n      `),
        s.replace(/^\s+/, "").replace(/\s+$/, "")).replace(/\s+/g, " "),
      }
      var s
    }
    showCharacter(t = {}) {
      return (
        (this._options.showCharacter = !0),
        this._withData(() => {
          var e
          return null === (e = this._renderState) || void 0 === e
            ? void 0
            : e
                .run(
                  V(
                    "main",
                    this._character,
                    "number" == typeof t.duration
                      ? t.duration
                      : this._options.strokeFadeDuration
                  )
                )
                .then((e) => {
                  var r
                  return (
                    null === (r = t.onComplete) || void 0 === r || r.call(t, e),
                    e
                  )
                })
        })
      )
    }
    hideCharacter(t = {}) {
      return (
        (this._options.showCharacter = !1),
        this._withData(() => {
          var e
          return null === (e = this._renderState) || void 0 === e
            ? void 0
            : e
                .run(
                  Q(
                    "main",
                    this._character,
                    "number" == typeof t.duration
                      ? t.duration
                      : this._options.strokeFadeDuration
                  )
                )
                .then((e) => {
                  var r
                  return (
                    null === (r = t.onComplete) || void 0 === r || r.call(t, e),
                    e
                  )
                })
        })
      )
    }
    animateCharacter(t = {}) {
      return (
        this.cancelQuiz(),
        this._withData(() => {
          var e
          return null === (e = this._renderState) || void 0 === e
            ? void 0
            : e
                .run(
                  Y(
                    "main",
                    this._character,
                    this._options.strokeFadeDuration,
                    this._options.strokeAnimationSpeed,
                    this._options.delayBetweenStrokes
                  )
                )
                .then((e) => {
                  var r
                  return (
                    null === (r = t.onComplete) || void 0 === r || r.call(t, e),
                    e
                  )
                })
        })
      )
    }
    animateStroke(t, e = {}) {
      return (
        this.cancelQuiz(),
        this._withData(() => {
          var r
          return null === (r = this._renderState) || void 0 === r
            ? void 0
            : r
                .run(
                  ((t, e, r, i) => {
                    const s = e.strokes[r]
                    return [
                      new B("character." + t, (r) => {
                        const i = r.character[t],
                          s = { opacity: 1, strokes: {} }
                        for (let t = 0; t < e.strokes.length; t++)
                          s.strokes[t] = {
                            opacity: i.opacity * i.strokes[t].opacity,
                          }
                        return s
                      }),
                      ...K(t, s, i),
                    ]
                  })(
                    "main",
                    this._character,
                    n(t, this._character.strokes.length),
                    this._options.strokeAnimationSpeed
                  )
                )
                .then((t) => {
                  var r
                  return (
                    null === (r = e.onComplete) || void 0 === r || r.call(e, t),
                    t
                  )
                })
        })
      )
    }
    highlightStroke(t, e = {}) {
      return this._withData(() => {
        var r, i
        if (this._character && this._renderState)
          return this._renderState
            .run(
              X(
                ((r = this._character.strokes), (i = t), r[n(i, r.length)]),
                d(this._options.highlightColor),
                this._options.strokeHighlightSpeed
              )
            )
            .then((t) => {
              var r
              return (
                null === (r = e.onComplete) || void 0 === r || r.call(e, t), t
              )
            })
      })
    }
    async loopCharacterAnimation() {
      return (
        this.cancelQuiz(),
        this._withData(() =>
          this._renderState.run(
            ((t, e, r, i, s, o) => {
              const n = Y(t, e, r, i, s)
              return n.push(new B.Delay(o)), n
            })(
              "main",
              this._character,
              this._options.strokeFadeDuration,
              this._options.strokeAnimationSpeed,
              this._options.delayBetweenStrokes,
              this._options.delayBetweenLoops
            ),
            { loop: !0 }
          )
        )
      )
    }
    pauseAnimation() {
      return this._withData(() => {
        var t
        return null === (t = this._renderState) || void 0 === t
          ? void 0
          : t.pauseAll()
      })
    }
    resumeAnimation() {
      return this._withData(() => {
        var t
        return null === (t = this._renderState) || void 0 === t
          ? void 0
          : t.resumeAll()
      })
    }
    showOutline(t = {}) {
      return (
        (this._options.showOutline = !0),
        this._withData(() => {
          var e
          return null === (e = this._renderState) || void 0 === e
            ? void 0
            : e
                .run(
                  V(
                    "outline",
                    this._character,
                    "number" == typeof t.duration
                      ? t.duration
                      : this._options.strokeFadeDuration
                  )
                )
                .then((e) => {
                  var r
                  return (
                    null === (r = t.onComplete) || void 0 === r || r.call(t, e),
                    e
                  )
                })
        })
      )
    }
    hideOutline(t = {}) {
      return (
        (this._options.showOutline = !1),
        this._withData(() => {
          var e
          return null === (e = this._renderState) || void 0 === e
            ? void 0
            : e
                .run(
                  Q(
                    "outline",
                    this._character,
                    "number" == typeof t.duration
                      ? t.duration
                      : this._options.strokeFadeDuration
                  )
                )
                .then((e) => {
                  var r
                  return (
                    null === (r = t.onComplete) || void 0 === r || r.call(t, e),
                    e
                  )
                })
        })
      )
    }
    updateDimensions({ width: t, height: e, padding: r }) {
      if (
        (void 0 !== t && (this._options.width = t),
        void 0 !== e && (this._options.height = e),
        void 0 !== r && (this._options.padding = r),
        this.target.updateDimensions(this._options.width, this._options.height),
        this._character &&
          this._renderState &&
          this._hanziWriterRenderer &&
          this._positioner)
      ) {
        this._hanziWriterRenderer.destroy()
        const t = this._initAndMountHanziWriterRenderer(this._character)
        this._renderState.overwriteOnStateChange((e) => t.render(e)),
          t.render(this._renderState.state),
          this._quiz && this._quiz.setPositioner(this._positioner)
      }
    }
    updateColor(t, e, r = {}) {
      var i
      let s = []
      const o = d(
        (() => ("radicalColor" !== t || e ? e : this._options.strokeColor))()
      )
      this._options[t] = e
      const n =
        null !== (i = r.duration) && void 0 !== i
          ? i
          : this._options.strokeFadeDuration
      return (
        (s = s.concat(G(t, o, n))),
        "radicalColor" !== t || e || (s = s.concat(G(t, null, 0))),
        this._withData(() => {
          var t
          return null === (t = this._renderState) || void 0 === t
            ? void 0
            : t.run(s).then((t) => {
                var e
                return (
                  null === (e = r.onComplete) || void 0 === e || e.call(r, t), t
                )
              })
        })
      )
    }
    quiz(t = {}) {
      return this._withData(async () => {
        this._character &&
          this._renderState &&
          this._positioner &&
          (this.cancelQuiz(),
          (this._quiz = new Z(
            this._character,
            this._renderState,
            this._positioner
          )),
          (this._options = { ...this._options, ...t }),
          this._quiz.startQuiz(this._options))
      })
    }
    cancelQuiz() {
      this._quiz && (this._quiz.cancel(), (this._quiz = void 0))
    }
    setCharacter(t) {
      return (
        this.cancelQuiz(),
        (this._char = t),
        this._hanziWriterRenderer && this._hanziWriterRenderer.destroy(),
        this._renderState && this._renderState.cancelAll(),
        (this._hanziWriterRenderer = null),
        (this._withDataPromise = this._loadingManager
          .loadCharData(t)
          .then((e) => {
            if (!e || this._loadingManager.loadingFailed) return
            ;(this._character = (function (t, e) {
              const r = T(e)
              return new R(t, r)
            })(t, e)),
              (this._renderState = new m(this._character, this._options, (t) =>
                r.render(t)
              ))
            const r = this._initAndMountHanziWriterRenderer(this._character)
            r.render(this._renderState.state)
          })),
        this._withDataPromise
      )
    }
    _initAndMountHanziWriterRenderer(t) {
      const { width: e, height: r, padding: i } = this._options
      this._positioner = new L({ width: e, height: r, padding: i })
      const s = new this._renderer.HanziWriterRenderer(t, this._positioner)
      return s.mount(this.target), (this._hanziWriterRenderer = s), s
    }
    async getCharacterData() {
      if (!this._char)
        throw new Error(
          "setCharacter() must be called before calling getCharacterData()"
        )
      return await this._withData(() => this._character)
    }
    _assignOptions(t) {
      const e = { ...mt, ...t }
      return (
        t.strokeAnimationDuration &&
          !t.strokeAnimationSpeed &&
          (e.strokeAnimationSpeed = 500 / t.strokeAnimationDuration),
        t.strokeHighlightDuration &&
          !t.strokeHighlightSpeed &&
          (e.strokeHighlightSpeed = 500 / e.strokeHighlightDuration),
        t.highlightCompleteColor ||
          (e.highlightCompleteColor = e.highlightColor),
        this._fillWidthAndHeight(e)
      )
    }
    _fillWidthAndHeight(t) {
      const e = { ...t }
      if (e.width && !e.height) e.height = e.width
      else if (e.height && !e.width) e.width = e.height
      else if (!e.width && !e.height) {
        const { width: t, height: r } = this.target.getBoundingClientRect(),
          i = Math.min(t, r)
        ;(e.width = i), (e.height = i)
      }
      return e
    }
    _withData(t) {
      if (this._loadingManager.loadingFailed)
        throw Error(
          "Failed to load character data. Call setCharacter and try again."
        )
      return this._withDataPromise
        ? this._withDataPromise.then(() => {
            if (!this._loadingManager.loadingFailed) return t()
          })
        : Promise.resolve().then(t)
    }
    _setupListeners() {
      this.target.addPointerStartListener((t) => {
        this._quiz &&
          (t.preventDefault(), this._quiz.startUserStroke(t.getPoint()))
      }),
        this.target.addPointerMoveListener((t) => {
          this._quiz &&
            (t.preventDefault(), this._quiz.continueUserStroke(t.getPoint()))
        }),
        this.target.addPointerEndListener(() => {
          var t
          null === (t = this._quiz) || void 0 === t || t.endUserStroke()
        })
    }
  }
  return (vt._loadingManager = null), (vt._loadingOptions = null), vt
})()
//# sourceMappingURL=hanzi-writer.min.js.map
