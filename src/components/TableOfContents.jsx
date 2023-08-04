'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
const GITHUB_EDIT_URL = 'https://github.com/storj/docs/tree/main/app'
//
function useTableOfContents(tableOfContents) {
  let [currentSection, setCurrentSection] = useState(tableOfContents[0]?.id)

  let getHeadings = useCallback((tableOfContents) => {
    return tableOfContents
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        let el = document.getElementById(id)
        if (!el) return

        let style = window.getComputedStyle(el)
        let scrollMt = parseFloat(style.scrollMarginTop)

        let top = window.scrollY + el.getBoundingClientRect().top - scrollMt
        return { id, top }
      })
      .filter((value) => value !== undefined)
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0) return
    let headings = getHeadings(tableOfContents)
    function onScroll() {
      let top = window.scrollY
      let current = headings[0].id
      for (let heading of headings) {
        if (top >= heading.top) {
          current = heading.id
        } else {
          break
        }
      }
      setCurrentSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [getHeadings, tableOfContents])

  return currentSection
}

export default function TableOfContents({ tableOfContents, filepath }) {
  let currentSection = useTableOfContents(tableOfContents)

  function isActive(section) {
    if (section.id === currentSection) {
      return true
    }
    if (!section.children) {
      return false
    }
    return section.children.findIndex(isActive) > -1
  }

  return (
    <nav aria-labelledby="on-this-page-title" className="w-56">
      {tableOfContents?.length > 0 && (
        <>
          <h2
            id="on-this-page-title"
            className="font-display text-sm font-medium text-slate-900 dark:text-white"
          >
            On this page
          </h2>
          <ol role="list" className="mt-4 space-y-3 text-sm">
            {tableOfContents.map((section) => (
              <li key={section.id}>
                <h3>
                  <Link
                    href={`#${section.id}`}
                    className={clsx(
                      isActive(section)
                        ? 'text-storj-blue-700'
                        : 'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    )}
                  >
                    {section.title}
                  </Link>
                </h3>
                {section.children.length > 0 && (
                  <ol
                    role="list"
                    className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"
                  >
                    {section.children.map((subSection) => (
                      <li key={subSection.id}>
                        <Link
                          href={`#${subSection.id}`}
                          className={
                            isActive(subSection)
                              ? 'text-storj-blue-700'
                              : 'hover:text-slate-600 dark:hover:text-slate-300'
                          }
                        >
                          {subSection.title}
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
      <div className="mt-3 space-y-2 border-t border-gray-200 pt-5 text-sm text-gray-900 dark:border-gray-300" />
      <a
        target="_blank"
        rel="noreferrer"
        className="text-sm text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
        href={`${GITHUB_EDIT_URL}${filepath}`}
      >
        Edit this page on GitHub →
      </a>
    </nav>
  )
}
