"use client"

import { useEffect, useRef, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import Avatar from "./Avatar"
import styles from "./AddFriend.module.css"
import { useTranslation } from "@/app/lib/i18n/useTranslation"

type SearchUser = {
  id: number
  username: string
  avatarUrl: string | null
}

type SearchUsersResponse = {
  data: SearchUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type Props = {
  friendIds: Set<number>
  meId: number | null
}

const RESULTS_PER_PAGE = 5

function buildSearchUrl(options: {
  query: string
  ageMin: string
  ageMax: string
  excludeIds: number[]
  sortBy: string
  order: string
  page: number
}): string {
  const params = new URLSearchParams()

  if (options.query.trim()) params.set("query", options.query.trim())
  if (options.ageMin.trim()) params.set("ageMin", options.ageMin.trim())
  if (options.ageMax.trim()) params.set("ageMax", options.ageMax.trim())
  if (options.excludeIds.length > 0) params.set("excludeIds", options.excludeIds.join(","))

  params.set("sortBy", options.sortBy)
  params.set("order", options.order)
  params.set("page", String(options.page))
  params.set("limit", String(RESULTS_PER_PAGE))

  return `/users/search?${params.toString()}`
}

export default function AddFriend({ friendIds, meId }: Props) {
  const { t } = useTranslation()

  const [query, setQuery] = useState("")

  const [ageMin, setAgeMin] = useState("")
  const [ageMax, setAgeMax] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const [sortBy, setSortBy] = useState<"username" | "createdAt">("username")
  const [order, setOrder] = useState<"asc" | "desc">("asc")

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [results, setResults] = useState<SearchUser[]>([])
  const [sent, setSent] = useState<Set<number>>(new Set())

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateQuery(value: string) { setQuery(value); setPage(1) }
  function updateAgeMin(value: string) { setAgeMin(value); setPage(1) }
  function updateAgeMax(value: string) { setAgeMax(value); setPage(1) }
  function updateSortBy(value: "username" | "createdAt") { setSortBy(value); setPage(1) }
  function updateOrder(value: "asc" | "desc") { setOrder(value); setPage(1) }

  useEffect(() => {
    if (debounceRef.current)
      clearTimeout(debounceRef.current)

    const hasQuery = query.trim().length > 0
    const hasAgeFilter = ageMin.trim() !== "" || ageMax.trim() !== ""

    if (!hasQuery && !hasAgeFilter) {
      setResults([])
      setTotal(0)
      setTotalPages(1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const excludeIds = [...friendIds, ...(meId !== null ? [meId] : [])]

      const url = buildSearchUrl({ query, ageMin, ageMax, excludeIds, sortBy, order, page })
      const res = await apiFetch(url)
      if (!res.ok) return

      const body: SearchUsersResponse = await res.json()
      setResults(body.data)
      setTotal(body.total)
      setTotalPages(body.totalPages)
    }, 300)
  }, [query, ageMin, ageMax, sortBy, order, page, friendIds, meId])

  const sendRequest = async (userId: number) => {
    const res = await apiFetch(`/friends/request/${userId}`, { method: "POST" })
    if (res.ok || res.status === 409) setSent(prev => new Set(prev).add(userId))
  }

  const hasSearched = query.trim().length > 0 || ageMin.trim() !== "" || ageMax.trim() !== ""

  return (
    <div className={styles.section}>
      <h3 className={styles.label}>{t("social.addFriendLabel")}</h3>

      <input
        type="text"
        value={query}
        onChange={e => updateQuery(e.target.value)}
        placeholder={t("social.searchPlaceholder")}
        className={styles.input}
      />

      <button
        type="button"
        onClick={() => setShowFilters(prev => !prev)}
        className={styles.filtersToggle}
      >
        {showFilters ? t("social.search.hideFilters") : t("social.search.filtersToggle")}
      </button>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterRow}>
            <input
              type="number"
              min={0}
              value={ageMin}
              onChange={e => updateAgeMin(e.target.value)}
              placeholder={t("social.search.ageMinPlaceholder")}
              className={styles.filterInput}
            />
            <input
              type="number"
              min={0}
              value={ageMax}
              onChange={e => updateAgeMax(e.target.value)}
              placeholder={t("social.search.ageMaxPlaceholder")}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterRow}>
            <label className={styles.filterLabel}>
              {t("social.search.sortByLabel")}
              <select
                value={sortBy}
                onChange={e => updateSortBy(e.target.value as "username" | "createdAt")}
                className={styles.filterSelect}
              >
                <option value="username">{t("social.search.sortByUsername")}</option>
                <option value="createdAt">{t("social.search.sortByCreatedAt")}</option>
              </select>
            </label>

            <label className={styles.filterLabel}>
              {t("social.search.orderLabel")}
              <select
                value={order}
                onChange={e => updateOrder(e.target.value as "asc" | "desc")}
                className={styles.filterSelect}
              >
                <option value="asc">{t("social.search.orderAsc")}</option>
                <option value="desc">{t("social.search.orderDesc")}</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className={styles.results}>
          {results.length === 0 && <p className={styles.empty}>{t("social.noUsersFound")}</p>}

          {results.length > 0 && (
            <p className={styles.resultsCount}>{t("social.search.resultsCount", { count: total })}</p>
          )}

          {results.map(user => (
            <div key={user.id} className={styles.row}>
              <Avatar username={user.username} avatarUrl={user.avatarUrl} size={28} />
              <span className={styles.rowUsername}>{user.username}</span>
              <button
                onClick={() => sendRequest(user.id)}
                disabled={sent.has(user.id)}
                className={styles.inviteBtn}
              >
                {sent.has(user.id) ? t("social.invited") : t("social.invite")}
              </button>
            </div>
          ))}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={styles.pageBtn}
              >
                {t("social.search.prev")}
              </button>
              <span className={styles.pageIndicator}>
                {t("social.search.pageIndicator", { page, totalPages })}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={styles.pageBtn}
              >
                {t("social.search.next")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
