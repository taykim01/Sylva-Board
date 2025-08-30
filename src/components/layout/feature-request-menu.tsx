"use client";

import { useRequestFeature } from "@/hooks/use-request-feature";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeatureRequestMenu() {
  const { t } = useTranslation('common');
  const { requestFeature, loading, setFeature, disabled, requestDialog, setRequestDialog } = useRequestFeature();

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setRequestDialog(true);
        }}
      >
        <Wrench size={16} className="text-slate-600" />
        {t('common.requestFeature')}
      </DropdownMenuItem>
      <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.requestFeatureTitle')}</DialogTitle>
            <DialogDescription>
              {t('common.requestFeatureDescription').split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < t('common.requestFeatureDescription').split('\n').length - 1 && <br />}
                </span>
              ))}
            </DialogDescription>
          </DialogHeader>
          <Textarea onChange={setFeature} className="resize-none" placeholder={t('common.requestFeaturePlaceholder')} />
          <DialogFooter>
            <Button onClick={requestFeature} loading={loading} disabled={disabled}>
              {t('common.sendRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
