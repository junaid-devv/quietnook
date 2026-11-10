import Link from "next/link";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="quietnook home">
      <svg aria-hidden="true" viewBox="0 0 60 64">
        <path
          d="M4 29 26 9l22 20M10 26v29h18V38h13v17h8V28"
          fill="none"
          stroke="#A6381B"
          strokeWidth="2.4"
        />
        <path
          d="M33 22c1-12 8-17 19-16-1 11-7 17-19 16ZM34 22 48 10M38 16c-10 1-12-5-11-11 8 0 12 4 11 11Z"
          fill="#FFF9F4"
          stroke="#153528"
          strokeWidth="2"
        />
      </svg>
      <span>
        quietnook
        <svg className="logo-underline" viewBox="0 0 200 12">
          <path
            d="M2 4c48-9 100 17 195-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
    </Link>
  );
}
