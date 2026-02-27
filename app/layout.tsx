import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { CompareNavButton } from '@/components/CompareNavButton';

export const metadata: Metadata = {
  title: 'THE WORLD FACTBOOK — Reference Edition 2026',
  description:
    'Comprehensive, authoritative country profiles and statistics. Open-source replacement for the CIA World Factbook.',
};

function WorldFactbookLogo() {
  return (
    <svg
      viewBox="0 0 512 512"
      className="h-11 w-11 shrink-0"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe ring */}
      <circle cx="256" cy="220" r="150" stroke="#0D2B45" strokeWidth="4.5" />

      {/* Globe grid */}
      <ellipse
        cx="256"
        cy="220"
        rx="104"
        ry="150"
        stroke="#0D2B45"
        strokeWidth="2.2"
      />
      <ellipse
        cx="256"
        cy="220"
        rx="56"
        ry="150"
        stroke="#0D2B45"
        strokeWidth="1.6"
      />
      <ellipse
        cx="256"
        cy="220"
        rx="150"
        ry="104"
        stroke="#0D2B45"
        strokeWidth="2.2"
      />
      <ellipse
        cx="256"
        cy="220"
        rx="150"
        ry="56"
        stroke="#0D2B45"
        strokeWidth="1.6"
      />
      <line
        x1="256"
        y1="70"
        x2="256"
        y2="370"
        stroke="#0D2B45"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Continents */}
      <path
        fill="#0D2B45"
        d="M170 145
           L182 138 L198 134 L214 136 L228 142 L238 150
           L244 160 L242 168 L235 174 L228 178 L220 181
           L214 186 L209 192 L202 197 L194 198 L186 195
           L180 190 L175 184 L170 180 L165 176 L161 170
           L160 162 L163 154 L170 145
           L178 146 L185 150 L191 154 L197 157 L204 156
           L210 152 L216 149 L221 150 L224 154 L222 160
           L216 164 L210 168 L204 172 L200 177 L198 183
           L202 188 L208 190 L214 193 L219 198 L222 204
           L220 209 L214 210 L209 207 L205 202 L201 197
           L196 194 L190 193 L184 194 L180 198 L183 203
           L190 206 L198 208 L205 211 L210 216 L212 221
           L209 224 L203 223 L197 220 L191 216 L186 212
           L182 208 L177 205 L173 200 L171 194 L170 188
           L166 183 L160 180 L154 176 L149 170 L148 163
           L151 155 L158 149 L166 146 Z"
      />
      <path
        fill="#0D2B45"
        d="M233 120
           L240 117 L247 119 L252 124 L253 131
           L250 138 L244 143 L238 142 L234 137
           L232 130 L233 120 Z"
      />
      <path
        fill="#0D2B45"
        d="M220 224
           L226 226 L232 232 L237 239 L240 248
           L239 258 L236 266 L232 274 L231 282
           L232 290 L231 299 L227 307 L221 313
           L214 315 L209 312 L207 306 L208 298
           L211 290 L215 282 L217 274 L216 266
           L214 258 L213 249 L214 240 L217 231
           L220 224
           L225 227 L228 233 L229 240 L227 248
           L224 255 L223 263 L224 271 L225 279
           L224 287 L221 294 L217 300 L214 304
           L214 297 L216 289 L218 281 L219 273
           L218 264 L217 256 L217 247 L218 238 Z"
      />
      <path
        fill="#0D2B45"
        d="M274 153
           L283 149 L292 149 L300 152 L306 157
           L309 163 L308 169 L304 173 L298 176
           L292 178 L287 181 L284 185 L280 187
           L275 186 L270 182 L268 176 L269 169
           L272 161 L274 153 Z"
      />
      <path
        fill="#0D2B45"
        d="M281 189
           L288 191 L295 196 L300 203 L303 212
           L304 222 L302 232 L299 242 L296 251
           L295 261 L296 271 L294 280 L289 288
           L282 293 L275 293 L270 288 L267 280
           L267 270 L269 260 L272 250 L273 241
           L272 232 L270 223 L270 214 L273 205
           L277 196 L281 189
           L286 194 L289 201 L290 209 L289 218
           L287 227 L286 236 L286 245 L287 254
           L287 263 L285 271 L282 278 L278 282
           L276 276 L276 267 L277 258 L279 249
           L280 239 L280 229 L279 220 L278 211
           L278 202 Z"
      />
      <path
        fill="#0D2B45"
        d="M300 154
           L312 150 L326 150 L339 153 L350 158
           L359 165 L363 173 L362 181 L357 187
           L349 191 L340 194 L331 195 L322 195
           L315 193 L309 191 L304 189 L300 184
           L297 178 L297 171 L299 163 L300 154
           L307 157 L314 160 L322 161 L330 161
           L337 163 L343 166 L347 171 L347 177
           L343 182 L336 184 L329 185 L322 185
           L315 184 L309 183 L304 180 L302 175
           L302 169 Z"
      />
      <path
        fill="#0D2B45"
        d="M314 206
           L320 206 L326 209 L329 214 L329 220
           L325 225 L321 229 L320 235 L317 240
           L312 241 L307 238 L304 232 L304 225
           L307 218 L311 211 L314 206 Z"
      />
      <path
        fill="#0D2B45"
        d="M354 207
           L358 209 L359 213 L358 217
           L355 220 L352 218 L351 214
           L352 210 L354 207 Z"
      />
      <path
        fill="#0D2B45"
        d="M325 278
           L334 275 L344 276 L351 281 L354 288
           L352 295 L346 300 L337 302 L328 301
           L321 297 L318 291 L319 284 L325 278
           L331 281 L338 282 L344 284 L347 288
           L345 293 L339 295 L332 294 L326 292
           L323 287 L324 282 Z"
      />
      <path
        fill="#0D2B45"
        d="M302 276
           L305 278 L306 283 L304 288
           L301 291 L298 288 L297 283
           L299 278 L302 276 Z"
      />

      {/* Left laurel */}
      <path
        d="M171 305 C146 283, 132 249, 134 209 C136 171, 153 140, 181 117"
        stroke="#0D2B45"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M163 292 C154 286, 149 277, 152 266 C162 270, 168 279, 167 290 Z" fill="#0D2B45" />
      <path d="M152 272 C143 266, 139 257, 141 246 C151 250, 157 259, 156 270 Z" fill="#0D2B45" />
      <path d="M144 249 C136 244, 132 235, 134 225 C143 228, 149 237, 148 247 Z" fill="#0D2B45" />
      <path d="M140 225 C133 221, 129 213, 130 203 C139 206, 144 214, 144 223 Z" fill="#0D2B45" />
      <path d="M140 201 C133 197, 130 189, 131 180 C139 183, 144 191, 144 200 Z" fill="#0D2B45" />
      <path d="M145 177 C138 173, 135 165, 136 155 C145 158, 149 166, 149 175 Z" fill="#0D2B45" />
      <path d="M154 154 C147 150, 144 142, 145 132 C154 135, 159 143, 158 152 Z" fill="#0D2B45" />
      <path d="M167 133 C160 129, 157 121, 158 111 C167 114, 172 122, 171 131 Z" fill="#0D2B45" />
      <path d="M183 117 C176 113, 173 106, 174 97 C182 100, 186 107, 186 115 Z" fill="#0D2B45" />
      <path d="M198 107 C191 104, 188 97, 189 89 C196 91, 200 98, 200 105 Z" fill="#0D2B45" />

      {/* Right laurel */}
      <path
        d="M341 305 C366 283, 380 249, 378 209 C376 171, 359 140, 331 117"
        stroke="#0D2B45"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M349 292 C358 286, 363 277, 360 266 C350 270, 344 279, 345 290 Z" fill="#0D2B45" />
      <path d="M360 272 C369 266, 373 257, 371 246 C361 250, 355 259, 356 270 Z" fill="#0D2B45" />
      <path d="M368 249 C376 244, 380 235, 378 225 C369 228, 363 237, 364 247 Z" fill="#0D2B45" />
      <path d="M372 225 C379 221, 383 213, 382 203 C373 206, 368 214, 368 223 Z" fill="#0D2B45" />
      <path d="M372 201 C379 197, 382 189, 381 180 C373 183, 368 191, 368 200 Z" fill="#0D2B45" />
      <path d="M367 177 C374 173, 377 165, 376 155 C367 158, 363 166, 363 175 Z" fill="#0D2B45" />
      <path d="M358 154 C365 150, 368 142, 367 132 C358 135, 353 143, 354 152 Z" fill="#0D2B45" />
      <path d="M345 133 C352 129, 355 121, 354 111 C345 114, 340 122, 341 131 Z" fill="#0D2B45" />
      <path d="M329 117 C336 113, 339 106, 338 97 C330 100, 326 107, 326 115 Z" fill="#0D2B45" />
      <path d="M314 107 C321 104, 324 97, 323 89 C316 91, 312 98, 312 105 Z" fill="#0D2B45" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="The World Factbook home"
            >
              <WorldFactbookLogo />

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-[0.24em] text-slate-100 sm:text-base">
                  THE WORLD FACTBOOK
                </div>
                <div className="truncate text-[10px] uppercase tracking-[0.28em] text-slate-400 sm:text-xs">
                  Reference Edition 2026
                </div>
              </div>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <CompareNavButton />
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
