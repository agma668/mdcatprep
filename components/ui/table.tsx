"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Additional class names for table container */
  containerClassName?: string;
}

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Highlight row on hover */
  hoverable?: boolean;
}

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

// ---------------------------------------------------------------------------
// Table Components
// ---------------------------------------------------------------------------

export function Table({
  className = "",
  containerClassName = "",
  children,
  ...props
}: TableProps) {
  return (
    <div
      className={`relative w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 ${containerClassName}`}
    >
      <table
        className={`w-full caption-bottom text-sm text-slate-700 dark:text-slate-300 ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }: TableHeaderProps) {
  return (
    <thead
      className={`border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }: TableBodyProps) {
  return (
    <tbody
      className={`divide-y divide-slate-200 dark:divide-slate-800 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableFooter({ className = "", children, ...props }: TableFooterProps) {
  return (
    <tfoot
      className={`border-t border-slate-200 bg-slate-50/50 font-medium text-navy dark:border-slate-800 dark:bg-slate-900/50 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </tfoot>
  );
}

export function TableRow({
  hoverable = true,
  className = "",
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors duration-150 ${
        hoverable ? "hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }: TableHeadProps) {
  return (
    <th
      className={`h-11 px-4 text-left align-middle font-medium text-navy dark:text-white [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }: TableCellProps) {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableCaption({
  className = "",
  children,
  ...props
}: TableCaptionProps) {
  return (
    <caption
      className={`mt-4 text-xs text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </caption>
  );
}

export default Table;
